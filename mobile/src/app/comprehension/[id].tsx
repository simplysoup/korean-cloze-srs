import { Redirect, useLocalSearchParams } from 'expo-router';
import ReaderSession from '../../features/comprehension/ReaderSession';
import { isCurriculumFeatureEnabled } from '../../features/flags';

export default function ComprehensionPassageRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  if (!isCurriculumFeatureEnabled('readingComprehension')) {
    return <Redirect href="/not-yet-implemented?feature=Reading%20Comprehension" />;
  }
  return <ReaderSession passageId={Array.isArray(id) ? id[0] : id} />;
}
