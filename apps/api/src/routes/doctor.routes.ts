import { Router, Request, Response } from 'express';
import { DoctorRepository } from '../repositories/doctor.repository.js';
import { PatientRepository } from '../repositories/patient.repository.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { createDoctorSchema, updateDoctorSchema } from '../validators/doctor.validator.js';
import { createPatientSchema } from '../validators/patient.validator.js';

const router = Router();
const doctorRepo = new DoctorRepository();
const patientRepo = new PatientRepository();

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { search, specialization, from, to, sort, page, limit } = req.query;
  const result = await doctorRepo.findPaginated({
    search: search as string,
    specialization: specialization as string,
    from: from as string,
    to: to as string,
    sort: sort as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  res.json({ success: true, ...result });
});

router.post('/', validate(createDoctorSchema), async (req: Request, res: Response): Promise<void> => {
  const doctor = await doctorRepo.create(req.body);
  res.status(201).json({ success: true, data: doctor });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const doctor = await doctorRepo.findById(req.params.id);
  if (!doctor) {
    res.status(404).json({ success: false, error: 'Doctor not found' });
    return;
  }
  res.json({ success: true, data: doctor });
});

router.patch('/:id', validate(updateDoctorSchema), async (req: Request, res: Response): Promise<void> => {
  const doctor = await doctorRepo.update(req.params.id, req.body);
  if (!doctor) {
    res.status(404).json({ success: false, error: 'Doctor not found' });
    return;
  }
  res.json({ success: true, data: doctor });
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const doctor = await doctorRepo.delete(req.params.id);
  if (!doctor) {
    res.status(404).json({ success: false, error: 'Doctor not found' });
    return;
  }
  res.json({ success: true, message: 'Doctor deleted successfully' });
});

router.get('/:id/patients', async (req: Request, res: Response): Promise<void> => {
  const { search, condition, from, to, page, limit } = req.query;
  const result = await patientRepo.findPaginated({
    doctorId: req.params.id,
    search: search as string,
    condition: condition as string,
    from: from as string,
    to: to as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  res.json({ success: true, ...result });
});

router.post('/:id/patients', validate(createPatientSchema.omit({ doctorId: true })), async (req: Request, res: Response): Promise<void> => {
  const doctor = await doctorRepo.findById(req.params.id);
  if (!doctor) {
    res.status(404).json({ success: false, error: 'Doctor not found' });
    return;
  }
  const patientData = { ...req.body, doctorId: req.params.id };
  const patient = await patientRepo.create(patientData);
  res.status(201).json({ success: true, data: patient });
});

export default router;
