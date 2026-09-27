import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header в стиле Мосгортранс */}
      <header className="bg-[#0054A6] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Логотип-заглушка */}
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-[#0054A6]"
                  fill="currentColor"
                >
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">Мосгортранс</h1>
                <p className="text-sm opacity-80">Официальный сайт</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6 text-sm">
              <span className="hover:opacity-80 cursor-pointer">Маршруты</span>
              <span className="hover:opacity-80 cursor-pointer">Расписание</span>
              <span className="hover:opacity-80 cursor-pointer">Новости</span>
              <span className="hover:opacity-80 cursor-pointer">Контакты</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl w-full text-center">
          {/* Иконка транспорта */}
          <div className="mb-8">
            <svg
              viewBox="0 0 120 120"
              className="w-32 h-32 mx-auto text-[#0054A6]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="60" cy="60" r="50" strokeDasharray="8 4" />
              <path
                d="M40 70 L60 50 L80 70"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M60 50 L60 80"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="mb-8">
            <p className="text-[#0054A6] text-body-3 font-bold mb-2">
              ОШИБКА 404
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Маршрут не найден
            </h1>
            <p className="text-gray-600 text-body-3 leading-relaxed">
              Запрашиваемая страница не существует или была перемещена.
              <br />
              Пожалуйста, проверьте правильность адреса или вернитесь на главную страницу.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="filled" size="large" asChild>
              <Link href="/">На главную</Link>
            </Button>
            <Button variant="outlined" size="large" asChild>
              <Link href="/admin">Админ панель</Link>
            </Button>
          </div>

          {/* Информационный блок */}
          <div className="mt-12 border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h3 className="font-bold text-gray-900 mb-3">Нужна помощь?</h3>
            <p className="text-gray-600 text-body-4 mb-4">
              Если вы считаете, что это ошибка системы, пожалуйста, сообщите нам.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                support@mosgortrans.ru
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                +7 (495) 539-54-54
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer в стиле Мосгортранс */}
      <footer className="bg-[#0054A6] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-3">О компании</h3>
              <p className="text-sm opacity-80">
                ГУП «Мосгортранс» — крупнейшее транспортное предприятие Европы
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3">Контакты</h3>
              <p className="text-sm opacity-80">
                г. Москва, ул. Щипов, д. 21
                <br />
                +7 (495) 539-54-54
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3">Режим работы</h3>
              <p className="text-sm opacity-80">
                Пн-Пт: 9:00 - 18:00
                <br />
                Сб-Вс: выходной
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 text-center text-sm opacity-80">
            © {new Date().getFullYear()} ГУП «Мосгортранс». Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}