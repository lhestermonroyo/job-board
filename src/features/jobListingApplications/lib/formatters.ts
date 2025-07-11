import { ApplicationStage } from '@/drizzle/schema';

export function formatJobListingApplicationStage(stage: ApplicationStage) {
  switch (stage) {
    case 'applied':
      return 'Applied';
    case 'interested':
      return 'Interested';
    case 'rejected':
      return 'Rejected';
    case 'interviewed':
      return 'Interviewed';
    case 'hired':
      return 'Hired';
    default:
      throw new Error(`Unknown application stage: ${stage satisfies never}`);
  }
}
