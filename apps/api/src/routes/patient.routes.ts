import { Router, Request, Response } from 'express';
import { PatientRepository } from '../repositories/patient.repository.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { updatePatientSchema } from '../validators/patient.validator.js';

const router = Router();
const patientRepo = new PatientRepository();

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { search, condition, doctorId, from, to, sort, page, limit } = req.query;
  const result = await patientRepo.findPaginated({
    search: search as string,
    condition: condition as string,
    doctorId: doctorId as string,
    from: from as string,
    to: to as string,
    sort: sort as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  res.json({ success: true, ...result });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const patient = await patientRepo.findById(req.params.id);
  if (!patient) {
    res.status(404).json({ success: false, error: 'Patient not found' });
    return;
  }
  res.json({ success: true, data: patient });
});

router.patch('/:id', validate(updatePatientSchema), async (req: Request, res: Response): Promise<void> => {
  const patient = await patientRepo.update(req.params.id, req.body);
  if (!patient) {
    res.status(404).json({ success: false, error: 'Patient not found' });
    return;
  }
  res.json({ success: true, data: patient });
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const patient = await patientRepo.delete(req.params.id);
  if (!patient) {
    res.status(404).json({ success: false, error: 'Patient not found' });
    return;
  }
  res.json({ success: true, message: 'Patient deleted successfully' });
});

export default router;
