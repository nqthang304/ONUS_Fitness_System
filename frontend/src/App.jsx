import { RouterProvider } from 'react-router-dom';
import { AuthProvider} from '@/providers/auth.providers';
import { NotificationProvider } from '@/providers/notification.providers';
import { router } from '@/routes';

function App() {

  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App
