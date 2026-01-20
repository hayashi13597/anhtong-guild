import { Card } from "@/components/ui/card";

const rules = [
  {
    title: "Nghiêm cấm công kích cá nhân",
    description:
      "Tuyệt đối không lăng mạ, miệt thị, xúc phạm, bắt nạt hay công kích cá nhân dưới mọi hình thức (trực tiếp hoặc gián tiếp). Bạn có thể tranh luận, nhưng hãy tranh luận một cách văn minh."
  },
  {
    title: "Không phân biệt đối xử",
    description:
      "Cấm tuyệt đối các nội dung mang tính phân biệt chủng tộc, giới tính, tôn giáo, hoặc vùng miền dưới mọi hình thức."
  },
  {
    title: "Giữ thái độ lịch sự, thân thiện",
    description:
      "Hãy cư xử đúng mực và tôn trọng lẫn nhau. Cộng đồng được tạo ra để giải trí và giao lưu, không phải để gây căng thẳng hay mâu thuẫn."
  },
  {
    title: "Hạn chế sử dụng từ ngữ thô tục",
    description:
      "Vui lòng sử dụng ngôn ngữ phù hợp, đặc biệt trong các kênh chat chung. Tránh gây khó chịu cho người khác."
  }
] as const;

export default function RulesSection() {
  return (
    <section
      id="rules"
      className="py-10 lg:py-20 bg-card/50 border-y border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            Nội Quy Bang Hội
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-2">
            Mục tiêu của tụi mình xây dựng một cộng đồng vui vẻ, thân thiện, và
            hỗ trợ lẫn nhau
          </p>
        </div>

        <div className="space-y-8">
          {/* Nội Quy Chung Section */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
              Nội Quy Chung
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {rules.map((rule, index) => (
                <Card
                  key={index}
                  className="bg-background border-border p-4 sm:p-6 gap-0"
                >
                  <h4 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3 flex items-start gap-2 sm:gap-3">
                    <span className="text-primary shrink-0">●</span>
                    <span>{rule.title}</span>
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed ml-5 sm:ml-6">
                    {rule.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Hệ Quả Khi Vi Phạm Section */}
          <div className="pt-6 sm:pt-8 border-t border-border">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
              Hệ Quả Khi Vi Phạm
            </h3>
            <Card className="bg-background/50 border-primary/30 border-2 p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h4 className="font-bold text-foreground mb-1 sm:mb-2 flex items-start gap-2 sm:gap-3">
                    <span className="text-orange-500 shrink-0">⚠️</span>
                    <span>Lần 1 (tùy mức độ vi phạm)</span>
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground ml-7 sm:ml-8">
                    Nhắc nhở, mute tạm thời hoặc tiễn khỏi server.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1 sm:mb-2 flex items-start gap-2 sm:gap-3">
                    <span className="text-red-500 shrink-0">🚫</span>
                    <span>Lần 2 (hoặc vi phạm nghiêm trọng)</span>
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground ml-7 sm:ml-8">
                    Ban vĩnh viễn, một đi không trở lại.
                  </p>
                </div>
                <div className="pt-3 sm:pt-4 border-t border-border">
                  <p className="text-muted-foreground italic text-xs sm:text-sm">
                    💡 Khi phát hiện hành vi vi phạm, mọi người hãy báo trực
                    tiếp cho BQT nhé
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
