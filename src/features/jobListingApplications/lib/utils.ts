import { ApplicationStage } from '@/drizzle/schema';

export function sortApplicationsByStage(
  a: ApplicationStage,
  b: ApplicationStage
): number {
  return APPLICATION_STAGE_ORDER[a] - APPLICATION_STAGE_ORDER[b];
}

const APPLICATION_STAGE_ORDER: Record<ApplicationStage, number> = {
  applied: 0,
  interested: 1,
  interviewed: 2,
  hired: 3,
  rejected: 4
};
