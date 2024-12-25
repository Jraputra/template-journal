import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('\n=== Request Details ===');
    console.log('Content-Type:', request.headers.get('content-type'));
    console.log('Method:', request.method);
    
    // Get raw body first
    const rawBody = await request.text();
    console.log('\n=== Raw Body ===');
    console.log(rawBody);

    // Parse JSON body
    let postData;
    try {
      postData = JSON.parse(rawBody);
    } catch (error) {
      console.error('JSON parse error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON data',
          details: error.message,
          receivedBody: rawBody
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('\n=== Parsed Data ===');
    console.log(postData);

    // Extract data
    const { title, description, date, content, tags, cover: coverPath } = postData;

    console.log('\n=== Extracted Data ===');
    console.log({
      title,
      description,
      date,
      content,
      tags,
      coverPath
    });

    // Validate required fields
    const missingFields: string[] = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!date) missingFields.push('date');
    if (!content) missingFields.push('content');
    if (!tags) missingFields.push('tags');
    if (!coverPath) missingFields.push('cover');

    if (missingFields.length > 0) {
      console.log('\n=== Validation Failed ===');
      console.log('Missing fields:', missingFields);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          receivedData: postData
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure directories exist
    const contentDir = path.join(process.cwd(), 'src', 'content', 'blog');
    await fs.mkdir(contentDir, { recursive: true });

    // Create MDX content with frontmatter
    const mdxContent = `---
title: "${title}"
description: "${description}"
date: "${date}"
tags: ${JSON.stringify(tags)}
cover: "${coverPath}"
---

${content}`;

    // Save MDX file
    const postPath = path.join(contentDir, `${slug}.mdx`);
    await fs.writeFile(postPath, mdxContent, 'utf-8');

    return new Response(
      JSON.stringify({ success: true, slug }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

async function getCoverCount(coversDir: string): Promise<number> {
  try {
    const files = await fs.readdir(coversDir);
    return files.filter(f => f.startsWith('cover') && f.endsWith('.png')).length;
  } catch {
    return 0;
  }
}
