import { useLocalSearchParams } from 'expo-router';
import { TopicModuleScreen } from '../../features/topics/ui/TopicModuleScreen';

export default function TopicRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topicId = typeof id === 'string' ? id : '';
  return <TopicModuleScreen key={topicId} id={topicId} />;
}
