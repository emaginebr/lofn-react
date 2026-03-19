import { Link } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { APP_NAME, ROUTES } from '../lib/constants';
import { UserMenu } from './UserMenu';
import { Hexagon, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center">
                <Hexagon className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                {APP_NAME}
              </span>
            </Link>

            {isAuthenticated && (
              <Link
                to={ROUTES.DASHBOARD}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-amber-500 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Painel Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-1.5 text-[13px] font-medium bg-amber-500 text-noir-950 rounded-lg hover:bg-amber-400 transition-colors"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
