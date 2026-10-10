// Netlify Edge Function for Serving Public Article Images as Direct JPEG/PNG
// Handles both base64-uploaded images from phone/PC and external URLs
// Endpoint: https://nijornews.netlify.app/api/image/:id.jpg

const FIREBASE_CONFIG = {
  projectId: 'refined-vista-kcbh2',
  apiKey: 'AIzaSyDv8YizE4IrTzMIzWacbnh4_axojnjAeqo',
  databaseId: 'ai-studio-nijornews-1efdbe8e-44bf-4d08-8903-51b8518e074d'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?fm=jpg&q=80&w=1200&h=630&fit=crop';

async function getArticleImage(id: string): Promise<{ dataUrl?: string; httpUrl?: string } | null> {
  const cleanId = id.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/${FIREBASE_CONFIG.databaseId}/documents/articles/${cleanId}?key=${FIREBASE_CONFIG.apiKey}`;

  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      if (cleanId === 'art-1') {
        return { httpUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?fm=jpg&q=80&w=1200&h=630&fit=crop' };
      }
      if (cleanId === 'art-2') {
        return { httpUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?fm=jpg&q=80&w=1200&h=630&fit=crop' };
      }
      return null;
    }

    const json: any = await res.json();
    const rawImage = json.fields?.image?.stringValue || '';

    if (!rawImage) {
      return null;
    }

    if (rawImage.startsWith('data:')) {
      return { dataUrl: rawImage };
    }

    return { httpUrl: rawImage };
  } catch (err) {
    console.error('Error fetching image for', id, err);
    return null;
  }
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // path e.g. /api/image/art-1.jpg or /api/image/art-1
  let id = '';
  if (pathParts.length >= 3) {
    id = pathParts[2];
  } else if (url.searchParams.get('id')) {
    id = url.searchParams.get('id') || '';
  }

  if (!id) {
    return Response.redirect(DEFAULT_IMAGE, 302);
  }

  const result = await getArticleImage(id);

  if (!result) {
    return Response.redirect(DEFAULT_IMAGE, 302);
  }

  // Case 1: Base64 uploaded image converted to binary
  if (result.dataUrl) {
    try {
      const parts = result.dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Str = parts[1] || '';

      const binaryString = atob(base64Str);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Response(bytes, {
        status: 200,
        headers: {
          'Content-Type': mime,
          'Content-Length': bytes.length.toString(),
          'Cache-Control': 'public, max-age=604800, immutable',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    } catch (e) {
      console.error('Base64 decode failed:', e);
      return Response.redirect(DEFAULT_IMAGE, 302);
    }
  }

  // Case 2: External HTTP URL (Unsplash, Cloudinary, etc.)
  if (result.httpUrl) {
    let cleanUrl = result.httpUrl;
    if (cleanUrl.includes('images.unsplash.com')) {
      cleanUrl = cleanUrl.replace(/auto=format/g, 'fm=jpg');
      if (!cleanUrl.includes('fm=')) {
        cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'fm=jpg&w=1200&h=630&fit=crop';
      }
    }
    return Response.redirect(cleanUrl, 302);
  }

  return Response.redirect(DEFAULT_IMAGE, 302);
}
