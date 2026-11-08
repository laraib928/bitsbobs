import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // 1. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
        },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type (${file.type}). Only JPG, PNG, and WebP images are allowed.`,
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 3. Ensure bucket 'product-images' exists and is public
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.id === 'product-images');
      if (!bucketExists) {
        await supabase.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        });
      }
    } catch (bucketErr) {
      console.warn('Error checking/creating product-images bucket:', bucketErr);
    }

    // 4. Generate clean unique filename
    const originalName = file instanceof File ? file.name : 'image.jpg';
    const sanitizedName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_+/g, '_');
    const fileName = `${Date.now()}-${sanitizedName}`;

    // 5. Convert to Buffer and upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          success: false,
          error: `Upload failed: ${uploadError.message}`,
        },
        { status: 500 }
      );
    }

    // 6. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: publicUrl,
      fileName,
    });
  } catch (err: any) {
    console.error('Unhandled upload error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'An unexpected error occurred during photo upload',
      },
      { status: 500 }
    );
  }
}

