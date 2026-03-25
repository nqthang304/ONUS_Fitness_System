import { RouterProvider } from 'react-router-dom';
import { AuthProvider} from '@/providers/auth.providers';
import { NotificationProvider } from '@/providers/notification.providers';
import { FitnessProvider } from './providers/fitness.providers';
import { router } from '@/routes';

function App() {

  return (
    <AuthProvider>
      <NotificationProvider>
        <FitnessProvider>
          <RouterProvider router={router} />
        </FitnessProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App
