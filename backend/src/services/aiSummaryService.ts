// backend/src/services/aiSummaryService.ts - Raw Data Version
import OpenAI from "openai";
import { Knex } from "knex";
import crypto from "crypto";
import { ICompensation } from "../../../shared-types/types";

interface RawDataSummaryInput {
  userCompensation: ICompensation;
  allCompensations: ICompensation[];
  locationCompensations: ICompensation[];
  practiceTypeCompensations: ICompensation[];
  experienceCompensations: ICompensation[];
  calculatedMetrics: {
    userPercentile: number;
    marketMedian: number;
    locationPercentile: number;
    practiceTypePercentile: number;
    experiencePercentile: number;
  };
}

interface CacheEntry {
  id: string;
  user_id: string;
  compensation_id: string;
  ai_summary: string;
  comparison_data_hash: any;
  created_at: Date;
  updated_at: Date;
}

class RawDataAISummaryService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  private anonymizeLocation(location: string): string {
    // Keep state/country but anonymize specific cities for privacy
    const parts = location.split(",");
    if (parts.length > 1) {
      return parts[parts.length - 1].trim(); // Just keep state/country
    }
    return location;
  }

  private anonymizeCompany(company: string): string {
    // Replace specific company names with generic types for privacy
    const genericMappings: { [key: string]: string } = {
      banfield: "Large Corporate Chain",
      vca: "Large Corporate Chain",
      bluepearl: "Emergency/Specialty Chain",
      petco: "Retail Chain",
      petsmart: "Retail Chain",
    };

    const lowerCompany = company.toLowerCase();
    for (const [key, value] of Object.entries(genericMappings)) {
      if (lowerCompany.includes(key)) {
        return value;
      }
    }

    // For unknown companies, just use generic terms
    if (
      company.toLowerCase().includes("hospital") ||
      company.toLowerCase().includes("clinic")
    ) {
      return "Private Practice";
    }

    return "Veterinary Practice";
  }

  private sampleCompensations(
    compensations: ICompensation[],
    maxCount: number
  ): ICompensation[] {
    if (compensations.length <= maxCount) {
      return compensations;
    }

    // Smart sampling: include highest, lowest, and random middle values
    const sorted = [...compensations].sort((a, b) => {
      const aSalary =
        a.payment_frequency === "hourly"
          ? (a.hourly_rate || 0) * 40 * 52
          : a.total_compensation || a.base_salary || 0;
      const bSalary =
        b.payment_frequency === "hourly"
          ? (b.hourly_rate || 0) * 40 * 52
          : b.total_compensation || b.base_salary || 0;
      return bSalary - aSalary;
    });

    const highEnd = sorted.slice(0, Math.floor(maxCount * 0.3)); // Top 30%
    const lowEnd = sorted.slice(-Math.floor(maxCount * 0.3)); // Bottom 30%
    const middle = sorted
      .slice(Math.floor(sorted.length * 0.3), Math.floor(sorted.length * 0.7))
      .slice(0, maxCount - highEnd.length - lowEnd.length); // Middle 40%

    return [...highEnd, ...middle, ...lowEnd];
  }

  private formatRawCompensationData(compensations: ICompensation[]): string {
    return compensations
      .map((comp) => {
        const salary =
          comp.payment_frequency === "hourly"
            ? (comp.hourly_rate || 0) * 40 * 52
            : comp.total_compensation || comp.base_salary || 0;

        const salaryK = Math.round(salary / 1000);
        const experience = comp.years_of_experience || 0;
        const practiceType = comp.type_of_practice || "General";
        const location = this.anonymizeLocation(comp.location);
        const company = this.anonymizeCompany(comp.company || "Practice");
        const specialist = comp.is_specialist ? `*${comp.specialization}` : "";
        const payType = comp.payment_frequency === "hourly" ? "H" : "S";

        return `${salaryK}k${payType}|${experience}yr|${practiceType}|${location}|${company}${specialist}`;
      })
      .join("\n");
  }

  private generateDataHash(data: RawDataSummaryInput): string {
    const hashData = {
      userId: data.userCompensation.id,
      userSalary:
        data.userCompensation.total_compensation ||
        data.userCompensation.base_salary,
      userPercentile: data.calculatedMetrics.userPercentile,
      marketSize: data.allCompensations.length,
      locationSize: data.locationCompensations.length,
      practiceTypeSize: data.practiceTypeCompensations.length,
      experienceSize: data.experienceCompensations.length,
      // Include first and last entries to detect data changes
      firstCompId: data.allCompensations[0]?.id,
      lastCompId: data.allCompensations[data.allCompensations.length - 1]?.id,
    };

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(hashData))
      .digest("hex");
  }

  async getSalarySummary(
    db: Knex,
    userId: string,
    compensationId: string,
    data: RawDataSummaryInput
  ): Promise<string> {
    const dataHash = this.generateDataHash(data);

    // Check cache first
    const cachedSummary = await db<CacheEntry>("salary_comparison_cache")
      .where({
        user_id: userId,
        compensation_id: compensationId,
      })
      .first();

    if (cachedSummary) {
      const cachedHash =
        typeof cachedSummary.comparison_data_hash === "string"
          ? cachedSummary.comparison_data_hash
          : JSON.stringify(cachedSummary.comparison_data_hash);

      if (cachedHash === dataHash) {
        console.log("Using cached raw data AI summary for user:", userId);
        return cachedSummary.ai_summary;
      } else {
        // Data has changed, delete old cache entry
        await db("salary_comparison_cache")
          .where({ user_id: userId, compensation_id: compensationId })
          .del();
      }
    }

    // Generate new summary with raw data
    const newSummary = await this.generateRawDataSummary(data);

    // Cache the new summary
    try {
      await db("salary_comparison_cache").insert({
        user_id: userId,
        compensation_id: compensationId,
        ai_summary: newSummary,
        comparison_data_hash: dataHash,
      });
      console.log("Cached new raw data AI summary for user:", userId);
    } catch (error) {
      console.error("Failed to cache AI summary:", error);
    }

    return newSummary;
  }

  async generateRawDataSummary(data: RawDataSummaryInput): Promise<string> {
    if (!this.openai) {
      return this.generateFallbackSummary(data);
    }

    try {
      // Sample data to control token costs while maintaining insights
      const sampledAll = this.sampleCompensations(data.allCompensations, 40);
      const sampledLocation = this.sampleCompensations(
        data.locationCompensations,
        20
      );
      const sampledPracticeType = this.sampleCompensations(
        data.practiceTypeCompensations,
        20
      );
      const sampledExperience = this.sampleCompensations(
        data.experienceCompensations,
        20
      );

      const userSalary =
        data.userCompensation.payment_frequency === "hourly"
          ? (data.userCompensation.hourly_rate || 0) * 40 * 52
          : data.userCompensation.total_compensation ||
            data.userCompensation.base_salary ||
            0;

      const prompt = `
Analyze this veterinarian's compensation using the raw market data provided.

USER'S PROFILE:
Company: ${this.anonymizeCompany(data.userCompensation.company || "")}
Location: ${this.anonymizeLocation(data.userCompensation.location)}
Title: ${data.userCompensation.title}
Practice Type: ${data.userCompensation.type_of_practice}
Experience: ${data.userCompensation.years_of_experience} years
Salary: $${userSalary.toLocaleString()} (${
        data.userCompensation.payment_frequency
      })
Specialist: ${
        data.userCompensation.is_specialist
          ? "Yes - " + data.userCompensation.specialization
          : "No"
      }

CALCULATED METRICS:
Overall Percentile: ${data.calculatedMetrics.userPercentile}th
Market Median: $${data.calculatedMetrics.marketMedian.toLocaleString()}
Location Percentile: ${data.calculatedMetrics.locationPercentile}th
Practice Type Percentile: ${data.calculatedMetrics.practiceTypePercentile}th
Experience Percentile: ${data.calculatedMetrics.experiencePercentile}th

RAW MARKET DATA:
Format: SalaryK(S=Salary,H=Hourly)|Experience|PracticeType|Location|Company|*Specialization

Overall Market (${data.allCompensations.length} total, showing sample):
${this.formatRawCompensationData(sampledAll)}

Location Matches (${data.locationCompensations.length} total):
${this.formatRawCompensationData(sampledLocation)}

Practice Type Matches (${data.practiceTypeCompensations.length} total):
${this.formatRawCompensationData(sampledPracticeType)}

Experience Matches (${data.experienceCompensations.length} total):
${this.formatRawCompensationData(sampledExperience)}

INSTRUCTIONS:
Generate exactly 2-3 professional sentences analyzing this veterinarian's compensation position. Focus on:
- Specific insights from the raw data patterns you observe
- Regional/practice type trends visible in the data
- How their compensation compares to similar professionals
- Any notable patterns in the market data (salary clusters, geographic differences, etc.)

Be factual, encouraging, and data-driven. Do not include recommendations.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a veterinary compensation analyst. Analyze raw market data to provide specific, insightful compensation analysis. Focus on patterns, trends, and data-driven insights.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 250,
        temperature: 0.6,
      });

      return (
        completion.choices[0]?.message?.content?.trim() ||
        this.generateFallbackSummary(data)
      );
    } catch (error) {
      console.error("Error generating raw data AI summary:", error);
      return this.generateFallbackSummary(data);
    }
  }

  private generateFallbackSummary(data: RawDataSummaryInput): string {
    const userSalary =
      data.userCompensation.payment_frequency === "hourly"
        ? (data.userCompensation.hourly_rate || 0) * 40 * 52
        : data.userCompensation.total_compensation ||
          data.userCompensation.base_salary ||
          0;

    const position =
      data.calculatedMetrics.userPercentile >= 75
        ? "upper tier"
        : data.calculatedMetrics.userPercentile >= 50
        ? "above average"
        : data.calculatedMetrics.userPercentile >= 25
        ? "middle range"
        : "entry level";

    const comparison =
      userSalary > data.calculatedMetrics.marketMedian
        ? "above"
        : userSalary === data.calculatedMetrics.marketMedian
        ? "at"
        : "below";

    return `Your compensation of $${userSalary.toLocaleString()} places you in the ${position} among ${
      data.allCompensations.length
    } veterinary professionals. This salary is ${comparison} the market median of $${data.calculatedMetrics.marketMedian.toLocaleString()}, with particularly strong positioning in your ${
      data.calculatedMetrics.locationPercentile >
      data.calculatedMetrics.practiceTypePercentile
        ? "geographic region"
        : "practice type"
    }.`;
  }

  // Clean up old cache entries
  async cleanupOldCache(db: Knex, daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedCount = await db("salary_comparison_cache")
      .where("created_at", "<", cutoffDate)
      .del();

    console.log(`Cleaned up ${deletedCount} old AI summary cache entries`);
  }
}

export default new RawDataAISummaryService();
