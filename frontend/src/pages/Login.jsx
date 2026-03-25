import { useState } from "react";
import { useAuth } from "@/providers/auth.providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Eye, EyeOff, AlertCircle } from "lucide-react";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1. Thêm state quản lý lỗi
  const [error, setError] = useState("");

  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errorMessage = await login(phone, password);

    if (errorMessage) {
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-figtree border-4 border-blue-100">
      <Card className="w-full max-w-md p-10 rounded-2xl shadow-xl bg-white border border-slate-100">

        <CardHeader className="space-y-1 text-center p-0 mb-1">
          <div className="bg-onus-blue w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Zap className="text-white w-8 h-8" />
          </div>

          <CardTitle className="text-3xl font-bold text-slate-900">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Hệ thống quản lý phòng tập ONUS
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} autoComplete="username">
          <CardContent className="space-y-6 p-0">

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-600">
                Tên đăng nhập / Số điện thoại
              </Label>
              <Input
                id="phone"
                name="username" 
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError("");
                }}
                required
                autoComplete="username"
                onFocus={(e) => e.target.removeAttribute('readonly')}
                readOnly
                className="rounded-lg px-4 py-3 border border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-600">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  autoComplete="current-password"
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  readOnly
                  className="rounded-lg px-4 py-3 pr-12 border border-slate-200"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-0 mt-8">
            <Button className="w-full bg-onus-blue hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200" type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </CardFooter>
        </form>

      </Card>
    </div>
  );
};

export default Login;