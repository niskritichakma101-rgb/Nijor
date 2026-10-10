// Netlify Serverless Function for Serving Public Article Images as Direct JPEG/PNG
// Route: /.netlify/functions/image?id=:id

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

    if (!rawImage) return null;
    if (rawImage.startsWith('data:')) return { dataUrl: rawImage };
    return { httpUrl: rawImage };
  } catch (err) {
    return null;
  }
}

export const handler = async (event: any) => {
  const params = event.queryStringParameters || {};
  let id = params.id || '';
  
  if (!id && event.path) {
    const parts = event.path.split('/').filter(Boolean);
    if (parts.length >= 3) {
      id = parts[2];
    }
  }

  if (!id) {
    return {
      statusCode: 302,
      headers: { Location: DEFAULT_IMAGE }
    };
  }

  const result = await getArticleImage(id);

  if (!result) {
    return {
      statusCode: 302,
      headers: { Location: DEFAULT_IMAGE }
    };
  }

  // Base64 image decoded to binary JPEG/PNG
  if (result.dataUrl) {
    try {
      const parts = result.dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Str = parts[1] || '';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=604800, immutable',
          'Access-Control-Allow-Origin': '*'
        },
        body: base64Str,
        isBase64Encoded: true
      };
    } catch (e) {
      return {
        statusCode: 302,
        headers: { Location: DEFAULT_IMAGE }
      };
    }
  }

  // External URL
  if (result.httpUrl) {
    let cleanUrl = result.httpUrl;
    if (cleanUrl.includes('images.unsplash.com')) {
      cleanUrl = cleanUrl.replace(/auto=format/g, 'fm=jpg');
      if (!cleanUrl.includes('fm=')) {
        cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'fm=jpg&w=1200&h=630&fit=crop';
      }
    }

    return {
      statusCode: 302,
      headers: { Location: cleanUrl }
    };
  }

  return {
    statusCode: 302,
    headers: { Location: DEFAULT_IMAGE }
  };
};
