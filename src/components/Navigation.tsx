import { useAppDispatch, useAppSelector } from '@/store/hook';
import { logout } from '@/store/session/authSlice';

const Navigation = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const userRole = user?.role==='ADMIN' ? 'Admin' : 'Student';

  return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{userRole} Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={() => dispatch(logout())}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
  )
}

export default Navigation