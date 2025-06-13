Tạo database (lưu ý: khi ở file .env DB_NAME phải theo tên db). import file .sql vào db

tạo thư mục chạy code, clone repository git clone https://github.com/HiepLuong203/bahishop-backend.git

cài dependencies: npm install chạy chương trình: npm run start

Cấu trúc Backend:

bahishop/

│

├── src/

│   ├── config/                 
│   │   └── db.ts               # Kết nối DB (Sequelize / TypeORM)
│

│   ├── middlewares/           
│   │   ├── auth.middleware.ts  # Gồm verifyToken + authorizeRoles

│   │   └── hashMiddleware.ts   # Mã hóa và so sánh mật khẩu


│   ├── routes/                
│

│   ├── controllers/           
│

│   ├── services/              
│

│   ├── models/                
│   │                 
│
└── types/# Định dạng dữ liệu sẽ nhập, update,...
│   └── server.ts             
│

├── .env

├── tsconfig.json

├── package.json

└── README.md

CẤU TRÚC FOLDER

🔧 config/
    • Vai trò: Cấu hình toàn cục cho ứng dụng.
        ◦ Thiết lập kết nối với MySQL qua Sequelize.
        ◦ Dùng biến môi trường .env để cấu hình (DB_HOST, DB_USER,...).
        ◦ Kiểm tra kết nối khi khởi động và log kết quả.

🎮 controllers/
    • Vai trò: Điều phối các request từ client.
        ◦ Xử lý các HTTP request như: create, getAll, getById, update, delete,...
        ◦ Giao tiếp với services/
        ◦ Trả dữ liệu cho frontend (qua res.json(...)).
        ◦ Đảm nhận vai trò "middleman" giữa route và logic nghiệp vụ.

🧠 services/
    • Vai trò: Chứa logic nghiệp vụ.
        ◦ Gọi các hàm tương tác cơ sở dữ liệu từ models/
        ◦ Là lớp trung gian để tách biệt giữa controller và model.
        ◦ Giúp dễ dàng mở rộng thêm các xử lý nghiệp vụ nếu cần (ví dụ: xử lý ảnh, kiểm tra tồn kho,...).

🧬 models/
    • Vai trò: Định nghĩa các model Sequelize, tương ứng bảng trong CSDL.
        ◦ Định nghĩa bảng Products với các cột như: name, price, stock_quantity, category_id, image_url, v.v.
        ◦ Cấu hình mối quan hệ: Product.belongsTo(Category) → tức là sản phẩm thuộc về một danh mục.
        ◦ Gồm các hàm CRUD nội bộ như addProduct, getAllProducts, updateProduct, deleteProduct…

🧱 types/
    • Vai trò: Định nghĩa interface/type TypeScript để quản lý kiểu dữ liệu rõ ràng.
    • File product.ts:
        ◦ Định nghĩa interface ProductAttributes để các lớp services, models biết kiểu dữ liệu khi thao tác với sản phẩm.

🛡️ middlewares/
    • Vai trò:
        ◦ Xử lý các chức năng trung gian như:
            ▪ Xác thực token người dùng.
            ▪ Phân quyền theo vai trò (role-based).
            ▪ Xử lý upload hình ảnh (như dùng multer).
        ◦ Bạn chưa gửi cụ thể file trong đây, nhưng có thể chứa: authMiddleware.ts, upload.ts, verifyRole.ts,...

🔁 routes/
    • Vai trò: Định nghĩa các endpoint API cho client sử dụng.
        ◦ Ví dụ /api/products, /api/products/:id
        ◦ Sẽ ánh xạ các endpoint đó đến ProductController.
