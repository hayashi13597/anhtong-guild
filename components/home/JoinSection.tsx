import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

const steps = [
  {
    number: "01",
    title: "Đọc Nội Quy & Chuẩn Bị Discord",
    description: "Đọc kỹ nội quy và đảm bảo có thể hoạt động trên Discord",
  },
  {
    number: "02",
    title: "Apply Guild Trong Game",
    description:
      "Apply guild theo khu vực bạn chơi (NA/EU hoặc VN/Asia). Nếu đang bị cooldown 6 tiếng, hãy note lại cho BQT",
  },
  {
    number: "03",
    title: "Trả Lời Mẫu Câu Hỏi",
    description:
      "Trả lời mẫu câu hỏi và đổi tên Discord trùng với tên trong game",
  },
] as const;

const questionTemplate = [
  {
    question: "Tên nhân vật trong game:",
    hint: "Vui lòng cung cấp tên chính xác của nhân vật",
  },
  {
    question: "Khu vực server:",
    hint: "VN / Asia / NA / EU",
  },
  {
    question: "Kênh chat thường dùng:",
    hint: "Discord / Facebook / Chat trong game / Khác",
  },
  {
    question: "Khung giờ rảnh và tần suất online:",
    hint: 'Ví dụ: "Ăn nằm cùng game, rảnh là lên" hoặc "Nô lệ tư bản nhưng vẫn đam mê"',
  },
  {
    question: "Ưu tiên của bạn khi tham gia cộng đồng:",
    hint: 'Ví dụ: "Giao lưu là chính, tìm nhóm chơi cùng" hoặc "Chơi game là chính, đi boss, chat khi cần"',
  },
] as const;

const guildInfo = [
  {
    region: "NA/EU",
    guildName: "AnhTong",
    guildID: "10000415",
  },
  {
    region: "VN/Asia",
    guildName: "AnhTongVN",
    guildID: "10211185",
  },
] as const;

export default function JoinSection() {
  return (
    <section id="join" className="py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            Cách Tham Gia Bang Hội
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-background border-border hover:border-primary/50 transition-all duration-300 p-6 sm:p-8 h-full gap-0">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </div>
          ))}
        </div>

        <div className="mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">
            Thông Tin Guild
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {guildInfo.map((guild, index) => (
              <div
                key={index}
                className="bg-background/50 p-4 sm:p-6 rounded-md border border-border"
              >
                <h4 className="text-base sm:text-lg font-bold text-foreground mb-3">
                  {guild.region}
                </h4>
                <p className="text-sm sm:text-base text-muted-foreground mb-2">
                  Guild:{" "}
                  <span className="text-foreground font-semibold">
                    {guild.guildName}
                  </span>
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  ID:{" "}
                  <span className="text-foreground font-semibold">
                    {guild.guildID}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 sm:mb-16 p-6 sm:p-8 rounded-lg bg-background border border-border">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">
            Mẫu Câu Hỏi Tham Gia
          </h3>
          <div className="space-y-4 sm:space-y-6">
            {questionTemplate.map((item, index) => (
              <div key={index}>
                <p className="text-foreground font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                  {index + 1}. {item.question}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm italic">
                  {item.hint}
                </p>
              </div>
            ))}

            <Button variant="default" asChild>
              <Link
                href="https://discord.com/channels/1457208671753867428/1457208672550785261"
                target="_blank"
                rel="noopener noreferrer"
              >
                Đăng ký tham gia
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
            Lưu Ý Quan Trọng
          </h3>
          <ul className="space-y-2 sm:space-y-3 text-foreground">
            <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>
                Tụi mình ưu tiên{" "}
                <span className="font-semibold">chất lượng hơn số lượng</span>,
                vì vậy sẽ ưu tiên những bạn tích cực hoạt động và thích giao lưu
                trên Discord
              </span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>
                Nếu rảnh thì vào{" "}
                <span className="font-semibold">voice trò chuyện</span> với tụi
                mình để được xét duyệt hoả tốc!
              </span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></span>
              <span>
                Hãy đảm bảo tên Discord của bạn{" "}
                <span className="font-semibold">trùng với tên trong game</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
