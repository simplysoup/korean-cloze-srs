import { Redirect } from 'expo-router';
import ReaderLibrary from '../../features/comprehension/ReaderLibrary';
import { isCurriculumFeatureEnabled } from '../../features/flags';

export default function ComprehensionIndexRoute() {
  if (!isCurriculumFeatureEnabled('readingComprehension')) {
    return <Redirect href="/not-yet-implemented?feature=Reading%20Comprehension" />;
  }
  return <ReaderLibrary />;
}
