import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UploadService } from './upload.service';

export const uploadRoutes = async (app: FastifyInstance) => {
  app.post('/', async (req: FastifyRequest, reply: FastifyReply) => {
    if (req.user?.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    try {
      const data = await req.file();
      if (!data) {
        return reply.status(400).send({ error: 'No image file uploaded' });
      }

      const result = await UploadService.saveLocalFile({
        filename: data.filename,
        mimetype: data.mimetype,
        file: data.file,
      });

      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'File upload failed' });
    }
  });
};
