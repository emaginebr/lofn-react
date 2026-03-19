import { useAuth } from 'nauth-react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, KeyRound } from 'lucide-react';
import { ROUTES } from '../lib/constants';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  if (!user) return null;

  return (
    <div className="relative group">
      <button className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-secondary transition-colors">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="text-[13px] font-medium hidden md:block text-foreground">
          {user.name || user.email}
        </span>
      </button>

      <div className="absolute right-0 mt-1.5 w-52 bg-card rounded-xl shadow-xl shadow-noir-950/20 border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <p className="text-[13px] font-semibold text-foreground">{user.name}</p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
        </div>

        <div className="py-1.5">
          <Link
            to={ROUTES.PROFILE}
            className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <User className="w-4 h-4" />
            Perfil
          </Link>
          <Link
            to={ROUTES.CHANGE_PASSWORD}
            className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            Alterar Senha
          </Link>
        </div>

        <div className="border-t border-border p-1.5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
