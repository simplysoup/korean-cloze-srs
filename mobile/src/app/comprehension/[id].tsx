import { useLocalSearchParams } from 'expo-router';
import ReaderSession from '../../features/comprehension/ReaderSession';

export default function ComprehensionPassageRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  return <ReaderSession passageId={Array.isArray(id) ? id[0] : id} />;
}
