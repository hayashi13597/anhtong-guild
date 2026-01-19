"use client";

import Link from "next/link";

export default function HeroSection() {
  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="inline-block">
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest px-3 sm:px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
              ⚔️ Chào mừng đến với
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-balance leading-tight">
            <span className="block text-foreground">ANHTONG</span>
          </h1>

          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 text-sm sm:text-base lg:text-lg text-muted-foreground px-2">
            <p>
              Tụi mình bắt đầu là những gương mặt xa lạ, rồi một ngày tình cờ
              lọt hố Nơi Gió Gặp Nhau và trở thành một nhóm hành tẩu giang hồ.
              Ban ngày đánh boss, ban đêm đàn ca tấu hài.
            </p>
            <p>
              AnhTong hướng tới một cộng đồng vui vẻ, thoải mái. Dù bạn online
              nhiều hay ít, ở đâu trên bản đồ thế giới, chỉ cần thích giao lưu
              và kết nối với mọi người thì sẽ luôn được chào đón.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="#rules"
              onClick={e => handleScroll(e, "rules")}
              className="px-6 sm:px-8 py-2 sm:py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors text-sm sm:text-base"
            >
              Xem Nội Quy
            </Link>
            <Link
              href="#join"
              onClick={e => handleScroll(e, "join")}
              className="px-6 sm:px-8 py-2 sm:py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 font-semibold transition-colors text-sm sm:text-base"
            >
              Cách Tham Gia
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
