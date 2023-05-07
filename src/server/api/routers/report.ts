import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { reportEditInput, reportInput } from "~/types"

import { z, } from "zod";

export const reportRouter = createTRPCRouter({
  
  /**
   * Get all Reports 
   */
  getAllReports: publicProcedure.query(async ({ ctx }) => {
    const reports = await ctx.prisma.report.findMany();
    return reports.map(
      ( { id, title, description, authorId, createdAt, updatedAt }) => (
        { id, title, description, authorId, createdAt, updatedAt }));
  }),

  /**
   * Get Reports by  UserId
   * @Input: userId: String 
   */
  getOwnReports: protectedProcedure.query(async ({ ctx }) => {
    const reports = await ctx.prisma.report.findMany({
      where: { authorId: ctx.session.user.id },
    });
    return reports.map( // authorId not needed, for own reports
      ( { id, title, description, createdAt, updatedAt } ) => (
        { id, title, description, createdAt, updatedAt }));
  }),

  /**
   * Get Reports by foreign AuthourId
   * @Input: userId: String 
   */
  getReportsByAuthorId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const reports = await ctx.prisma.report.findMany({
      where: {
        id: input,
      },
    });
    return reports.map(( { id, title, description, authorId, createdAt, updatedAt }) => ({ id, title, description, authorId, createdAt, updatedAt }));
  }),

  /**
   * Get Report by Id
   * @Input: userId: String 
   */
  getReportById: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const report = await ctx.prisma.report.findFirst({
      where: {
        id: input,
      },
    });
    return report;
  }),
  
  deleteOwnReport: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    // First, check if the report exists
    const existingReport = await ctx.prisma.report.findUnique({
      where: {
        id: input,
      },
    });
    if (!existingReport) {
      throw new Error('Report not found');
    }
  
    // Then, check if the user is the author of the report
    if (existingReport.authorId !== ctx.session.user.id) {
      throw new Error('You are not authorized to delete this report');
    }
  
    // Finally, delete the report
    await ctx.prisma.report.delete({
      where: {
        id: input,
      },
    });
    
    return { success: true };
  }),


  create: protectedProcedure.input(reportInput).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.report.create({
      data: {
        title: input.title,
        description: input.description,
        author: {
          connect: {
            id: ctx.session.user.id,
          },
        },
      },
    });
  }),


  saveOwnReport: protectedProcedure.input(reportEditInput).mutation(async ({ ctx, input }) => {
    // First, check if the report exists
    const existingReport = await ctx.prisma.report.findUnique({
      where: {
        id: input.id,
      },
    });
    
    // Then, check if the user is the author of the report
    if (existingReport && existingReport.authorId !== ctx.session.user.id) {
      throw new Error('You are not authorized to edit this report');
    }
    
    // Create or update the report
    const data = {
      ...input,
      authorId: ctx.session.user.id,
    };
    const report = await ctx.prisma.report.upsert({
      where: {
        id: input.id,
      },
      create: data,
      update: data,
    });
    
    return report;
  })


}


)
