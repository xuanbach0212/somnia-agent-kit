# 📖 Hướng Dẫn Setup GitBook

Hướng dẫn chi tiết để thiết lập GitBook cho dự án Somnia AI.

## 🎯 Tổng Quan

GitBook là nền tảng tuyệt vời để tạo tài liệu chuyên nghiệp với:
- ✅ Giao diện đẹp, dễ đọc
- ✅ Tìm kiếm mạnh mẽ
- ✅ Tự động đồng bộ với GitHub
- ✅ Hỗ trợ markdown đầy đủ
- ✅ Responsive trên mọi thiết bị

## 📁 Cấu Trúc Tài Liệu

Dự án đã được tổ chức sẵn với cấu trúc sau:

```
docs/
├── README.md                 # Trang chủ
├── SUMMARY.md               # Menu navigation (quan trọng!)
├── .gitbook.yaml            # Config file
├── quickstart.md            # Hướng dẫn nhanh
├── installation.md          # Cài đặt
├── architecture.md          # Kiến trúc
├── faq.md                   # Câu hỏi thường gặp
├── troubleshooting.md       # Xử lý lỗi
│
├── contracts/               # Smart Contracts
│   ├── agent-registry.md
│   ├── agent-vault.md
│   └── ...
│
├── examples/                # Ví dụ
│   ├── simple-agent.md
│   ├── onchain-chatbot.md
│   ├── monitoring.md
│   └── ...
│
├── deployment/              # Deployment
│   └── production.md
│
└── resources/               # Tài nguyên
    ├── glossary.md
    └── links.md
```

## 🚀 Bước 1: Tạo Tài Khoản GitBook

1. Truy cập: https://www.gitbook.com
2. Đăng ký tài khoản (miễn phí cho open source)
3. Xác nhận email

## 🔗 Bước 2: Kết Nối với GitHub

### 2.1 Tạo Space Mới

1. Click "**New Space**"
2. Chọn "**Import from GitHub**"
3. Authorize GitBook để truy cập GitHub
4. Chọn repository: `somnia-ai`
5. Chọn branch: `dev` (hoặc `main`)

### 2.2 Cấu Hình Sync

GitBook sẽ tự động:
- Đọc file `SUMMARY.md` để tạo menu
- Đọc file `.gitbook.yaml` để biết thư mục docs
- Đồng bộ mỗi khi bạn push code

## ⚙️ Bước 3: Cấu Hình GitBook

### 3.1 Kiểm Tra Config

File `.gitbook.yaml` đã được tạo sẵn:

```yaml
root: ./docs/

structure:
  readme: README.md
  summary: SUMMARY.md

redirects:
  previous/page: new-folder/page.md
```

### 3.2 Tùy Chỉnh Theme

Trong GitBook dashboard:
1. Vào **Customize**
2. Chọn theme (Light/Dark)
3. Upload logo (nếu có)
4. Chọn màu chủ đạo
5. Tùy chỉnh font

### 3.3 Cấu Hình Domain

**Option 1: Subdomain miễn phí**
- URL: `your-space.gitbook.io`
- Tự động có sẵn

**Option 2: Custom domain (Pro)**
- Ví dụ: `docs.somnia-ai.com`
- Cần upgrade plan
- Cấu hình DNS:
  ```
  CNAME docs.somnia-ai.com -> hosting.gitbook.io
  ```

## 📝 Bước 4: Tùy Chỉnh Nội Dung

### 4.1 Sử Dụng GitBook Hints

GitBook hỗ trợ các hint boxes đẹp:

```markdown
{% hint style="info" %}
Đây là thông tin hữu ích
{% endhint %}

{% hint style="warning" %}
Cảnh báo quan trọng
{% endhint %}

{% hint style="danger" %}
Lưu ý nguy hiểm
{% endhint %}

{% hint style="success" %}
Thành công!
{% endhint %}
```

### 4.2 Sử Dụng Tabs

```markdown
{% tabs %}
{% tab title="TypeScript" %}
\`\`\`typescript
const agent = new SomniaAgent();
\`\`\`
{% endtab %}

{% tab title="JavaScript" %}
\`\`\`javascript
const agent = new SomniaAgent();
\`\`\`
{% endtab %}
{% endtabs %}
```

### 4.3 Embed Code

```markdown
{% code title="agent.ts" lineNumbers="true" %}
\`\`\`typescript
import { SomniaAgentKit } from '@somnia/agent-kit';

const kit = new SomniaAgentKit({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
});
\`\`\`
{% endcode %}
```

### 4.4 Embed Videos

```markdown
{% embed url="https://www.youtube.com/watch?v=VIDEO_ID" %}
Tutorial video
{% endembed %}
```

## 🎨 Bước 5: Tùy Chỉnh Nâng Cao

### 5.1 Thêm Search

GitBook tự động có search, nhưng bạn có thể tối ưu:

```markdown
---
description: Mô tả ngắn gọn cho SEO và search
---

# Tiêu đề trang
```

### 5.2 Thêm Table of Contents

```markdown
# Trang dài

## Mục lục

- [Section 1](#section-1)
- [Section 2](#section-2)
- [Section 3](#section-3)

## Section 1
...
```

### 5.3 Thêm Images

```markdown
![Alt text](../images/screenshot.png)

# Hoặc với caption
{% figure src="../images/architecture.png" alt="Architecture" %}
Kiến trúc hệ thống Somnia AI
{% endfigure %}
```

### 5.4 Thêm API Documentation

```markdown
{% swagger src="../api-spec.yaml" path="/api/agents" method="get" %}
[api-spec.yaml](../api-spec.yaml)
{% endswagger %}
```

## 🔄 Bước 6: Workflow Cập Nhật

### Cập Nhật Tài Liệu

```bash
# 1. Chỉnh sửa file markdown
vim docs/quickstart.md

# 2. Commit và push
git add docs/
git commit -m "docs: update quickstart guide"
git push origin dev

# 3. GitBook tự động sync (trong vài giây)
```

### Xem Preview

1. Trong GitBook dashboard
2. Click "**View**" để xem bản preview
3. Hoặc truy cập URL: `your-space.gitbook.io`

### Publish Changes

GitBook có 2 modes:
- **Live**: Tự động publish mỗi khi push
- **Manual**: Cần click "Publish" manually

Cấu hình trong **Settings** > **Git Sync**

## 📊 Bước 7: Analytics & Monitoring

### 7.1 Google Analytics

1. Vào **Integrations** > **Google Analytics**
2. Nhập Tracking ID
3. Save

### 7.2 Xem Statistics

GitBook cung cấp:
- Page views
- Popular pages
- Search queries
- User locations

Xem trong **Insights** tab

## 🤝 Bước 8: Collaboration

### Thêm Team Members

1. Vào **Settings** > **Members**
2. Invite by email
3. Chọn role:
   - **Admin**: Full access
   - **Editor**: Có thể edit
   - **Reader**: Chỉ đọc

### Review Changes

GitBook có change request workflow:
1. Editor tạo change request
2. Admin review
3. Approve/Reject
4. Publish

## 🎯 Bước 9: SEO Optimization

### 9.1 Meta Tags

Thêm vào đầu mỗi file:

```markdown
---
description: Mô tả ngắn gọn cho SEO (max 160 chars)
---

# Tiêu đề
```

### 9.2 Sitemap

GitBook tự động tạo sitemap:
- URL: `your-space.gitbook.io/sitemap.xml`

### 9.3 robots.txt

GitBook tự động cấu hình robots.txt

## 🚀 Bước 10: Go Live!

### Checklist Trước Khi Publish

- ✅ Tất cả links hoạt động
- ✅ Images hiển thị đúng
- ✅ Code examples chạy được
- ✅ Không có typos
- ✅ Navigation logic
- ✅ Search hoạt động
- ✅ Mobile responsive

### Publish

1. Review toàn bộ docs
2. Click "**Publish**" (nếu manual mode)
3. Share URL với team
4. Announce trên Discord/Twitter

## 📱 Bonus: Mobile App

GitBook có mobile app:
- iOS: [App Store](https://apps.apple.com/app/gitbook/id1474103993)
- Android: [Play Store](https://play.google.com/store/apps/details?id=io.gitbook.mobile)

Cho phép đọc docs offline!

## 🎓 Tips & Tricks

### 1. Sử Dụng Emoji

Emoji làm docs dễ đọc hơn:
- 🚀 Deployment
- 🔧 Configuration
- 💡 Tips
- ⚠️ Warnings
- ✅ Success

### 2. Consistent Formatting

```markdown
# H1 - Tiêu đề chính (1 per page)
## H2 - Section chính
### H3 - Subsection
#### H4 - Chi tiết

**Bold** cho keywords
*Italic* cho emphasis
`code` cho code inline
```

### 3. Link Best Practices

```markdown
# ✅ Good - relative links
[Quick Start](./quickstart.md)

# ❌ Bad - absolute links
[Quick Start](https://docs.somnia-ai.com/quickstart)
```

### 4. Code Block Languages

```markdown
\`\`\`typescript
// TypeScript code
\`\`\`

\`\`\`bash
# Shell commands
\`\`\`

\`\`\`json
{
  "config": "value"
}
\`\`\`
```

## 🆘 Troubleshooting

### Sync Không Hoạt Động

1. Check GitHub webhook settings
2. Re-authorize GitBook
3. Manual trigger sync trong GitBook

### Images Không Hiển Thị

1. Check image path (relative vs absolute)
2. Ensure images trong Git
3. Check file size (max 5MB)

### Search Không Tìm Thấy

1. Wait vài phút sau khi publish
2. Re-index trong Settings
3. Check content có searchable không

## 📚 Resources

- **GitBook Docs**: https://docs.gitbook.com
- **Markdown Guide**: https://www.markdownguide.org
- **GitBook Community**: https://github.com/GitbookIO/community

---

## 🎉 Hoàn Thành!

Bây giờ bạn đã có một bộ tài liệu chuyên nghiệp với GitBook!

**Next Steps:**
1. Share docs URL với team
2. Announce trên social media
3. Gather feedback từ users
4. Continuous improvement

**URL của bạn:**
- GitBook: `https://your-space.gitbook.io`
- Custom domain: `https://docs.somnia-ai.com` (nếu setup)

---

**Chúc mừng!** 🎊 Docs của bạn giờ đã professional và dễ sử dụng!

