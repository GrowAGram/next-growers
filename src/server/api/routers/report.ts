/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { getReportsInput, reportEditInput, reportInput } from "~/types"

import { z, } from "zod";

export const reportRouter = createTRPCRouter({
  
  /**
   * Get all Reports with author information
   */
  getAllReports: publicProcedure.query(async ({ ctx }) => {
    const reports = await ctx.prisma.report.findMany({
      include: { 
        author: { select: { id: true, name: true, image: true } }, 
        image: { select: { id: true , publicId: true, cloudUrl: true } }, 
      },
    });
    return reports.map(({ id, image, title, description, author, createdAt, updatedAt }) => ({
      id,
      imagePublicId: image?.publicId,
      imageCloudUrl: image?.cloudUrl,
      title,
      description,
      authorId: author?.id,
      authorName: author?.name,
      authorImage: author?.image,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    }));
  }),

  /**
   * Get own Reports by authorId
   * @Input: userId: String 
   */
  getOwnReports: protectedProcedure.input(getReportsInput).query(async ({ ctx, input }) => {
    
    const { orderBy, desc } = input;


    const reports = await ctx.prisma.report.findMany({
      orderBy: {
        [orderBy]: desc ? 'desc' : 'asc'
      },
      include: { 
        author: { select: { id: true, name: true, image: true } }, 
        image: { select: { id: true , publicId: true, cloudUrl: true } }, 
      },
      where: { authorId: ctx.session.user.id },
    });
    return reports.map(({ id, image, title, description, author, createdAt, updatedAt }) => ({
      id,
      imagePublicId: image?.publicId,
      imageCloudUrl: image?.cloudUrl,
      title,
      description,
      authorId: author?.id,
      authorName: author?.name,
      authorImage: author?.image,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    }));
  }),

  /**
   * Get Report by Id
   * @Input: userId: String 
   */
  getReportById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const report = await ctx.prisma.report.findUnique({
      include: { 
        author: { select: { id: true, name: true, image: true } }, 
        image: { select: { id: true , publicId: true, cloudUrl: true } }, 
      },
      where: {
        id: input,
      },
    });
    return {
      id: report?.id,
      imagePublicId: report?.image?.publicId,
      imageCloudUrl: report?.image?.cloudUrl,
      title: report?.title,
      description: report?.description,
      authorId: report?.author?.id,
      authorName: report?.author?.name,
      authorImage: report?.author?.image,
      createdAt: report?.createdAt.toISOString(),
      updatedAt: report?.updatedAt.toISOString(),
    };
  }),
  
  /**
   * Get Reports by foreign AuthourId
   * @Input: userId: String 
   */
  getReportsByAuthorId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const reports = await ctx.prisma.report.findMany({
      include: { 
        author: { select: { id: true, name: true, image: true } }, 
        image: { select: { id: true , publicId: true, cloudUrl: true } }, 
      },
      where: {
        id: input,
      },
    });
    return reports.map(( { id, title, description, authorId, createdAt, updatedAt }) => ({ id, title, description, authorId, createdAt, updatedAt }));
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
        image: {
          connect: {
            id: input.imageId,
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
  }),


}

)
