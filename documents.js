import { put, del, list } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

// Simulación de base de datos con Vercel Blob
let documentsMetadata = [];

export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Obtener todos los documentos
      const { blobs } = await list();
      
      const docs = blobs
        .filter(blob => blob.pathname.startsWith('documents/'))
        .map(blob => {
          const metadata = blob.pathname.split('/')[1].split('_');
          return {
            id: parseInt(metadata[0]),
            title: decodeURIComponent(metadata[1] || 'Sin título'),
            ageRestriction: metadata[2] || '18+',
            fileUrl: blob.url,
            uploadDate: new Date(blob.uploadedAt).toLocaleDateString()
          };
        });

      return res.status(200).json(docs);
    }

    if (req.method === 'POST') {
      // Subir nuevo documento
      const contentType = req.headers['content-type'] || '';
      
      if (contentType.includes('multipart/form-data')) {
        // Manejo de FormData desde el cliente
        return res.status(400).json({ 
          error: 'Usar JSON en lugar de FormData' 
        });
      }

      const { title, ageRestriction, fileData } = req.body;

      if (!title || !ageRestriction || !fileData) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos' 
        });
      }

      // Convertir base64 a buffer
      const base64Data = fileData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      const id = Date.now();
      const filename = `documents/${id}_${encodeURIComponent(title)}_${ageRestriction}.pdf`;

      // Subir a Vercel Blob
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: 'application/pdf',
      });

      return res.status(200).json({ 
        success: true,
        url: blob.url 
      });
    }

    if (req.method === 'DELETE') {
      // Eliminar documento
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID requerido' });
      }

      // Buscar el blob con ese ID
      const { blobs } = await list();
      const blobToDelete = blobs.find(blob => 
        blob.pathname.startsWith(`documents/${id}_`)
      );

      if (blobToDelete) {
        await del(blobToDelete.url);
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Error del servidor' 
    });
  }
}