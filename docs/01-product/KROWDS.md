# KROWDS-PB-001 — KROWDS

| Field | Nilai |
| --- | --- |
| Document ID | `KROWDS-PB-001` |
| Jenis dokumen | Product Brief / Product Vision |
| Status | `Draft` |
| Version | `0.1` |
| Last updated | `2026-09-24` |
| Product owner | Product Team (`TBD`) |
| Technical owner | Engineering (`TBD`) |
| Security and privacy reviewer | `TBD` |
| Approval owner | Product and Engineering (`TBD`) |
| Canonical English document | [PRODUCT-VISION.md](PRODUCT-VISION.md) |

Dokumen ini adalah product brief Bahasa Indonesia. Dokumen acuan dalam Bahasa Inggris tersedia di [PRODUCT-VISION.md](PRODUCT-VISION.md). Keduanya menjelaskan target produk; implementasi repository saat ini masih berupa scaffold.

## Keputusan yang sudah dikonfirmasi

- MVP phased: foundation/auth, commerce, fulfillment, lalu access dan audit.
- Actor dipisahkan menjadi User, Identity, Visitor/Ticket Holder, Organization, Membership, dan KREW.
- Tenant model menggunakan shared PostgreSQL schema, `organization_id`, dan Row-Level Security.
- Hierarchy produk menggunakan `Organization → Venue → Event → optional Activity → Session`; tidak ada Branch sebagai entity, table, field, atau API resource.
- MVP menggunakan single-use ticket, tanpa transfer, re-entry, multi-use, dan offline gate.
- Xendit menjadi source of truth pembayaran; MVP menggunakan IDR, QRIS, Virtual Account, dan e-wallet.
- Resend menjadi provider email transactional.
- Biteship menjadi provider shipping domestic; organisasi memilih dan membayar ongkos, COD tidak tersedia pada MVP.
- Go + Gin memiliki auth, authorization, API, provider orchestration, dan audit boundary.
- Deployment target memakai GCP project terpisah (`krowds-dev`, `krowds-staging`, `krowds-prod`) dan region Jakarta.
- QR wristband memakai opaque random token minimal 128-bit, hashed at rest, status-bound, revocable, dan tidak membawa PII.
- Consumer identity verification memakai manual KREW review; OCR, liveness, dan consumer identity-document image tidak diaktifkan pada MVP.
- OTP baseline adalah expiry 15 menit, maksimal 5 percobaan, dan resend cooldown 60 detik; KREW, Platform Admin, Finance, dan Organization Admin memakai TOTP atau WebAuthn untuk MFA.
- Gate access memakai registered device dan online authoritative decision; device lifecycle dan setiap denial diaudit.
- Seluruh requirement, decision, dan test reference memakai prefix `KROWDS-`.
- Retention baseline: account/profile 24 bulan setelah closure, OTP/auth logs 30 hari, support dan shipping 12 bulan, finance/transaction 7 tahun, audit/security 24 bulan, production CSV 30 hari setelah activation, identity-review evidence 24 bulan, event-level analytics 30 hari, wristband/QR history 24 bulan, organization legal/banking records 7 tahun, backups 7/14/35 hari, dan operational logs 30/90/365 hari; legal hold dapat memperpanjangnya.
- Legal basis memakai contract/service necessity untuk account, auth, ticket, payment, shipping, dan fulfillment; optional analytics/marketing/profile membutuhkan explicit consent.
- Xendit online instruction berlaku 30 menit, cashier QRIS 15 menit; refund request full berlaku sebelum Bound/Used dan dalam 7 hari kalender, dengan Finance atau Organization Admin approval serta daily reconciliation dan weekly sign-off.
- Session access 15 menit, rotating refresh 30 hari, recovery link 24 jam; privileged MFA memakai TOTP atau WebAuthn.
- Onboarding organization mewajibkan legal entity, registration, representative, tax ID, address, bank verification, dan authorized signatory; SLA review KREW 2 business days.
- Consumer identity memakai minimal type, number, dan full legal name; guardian untuk usia di bawah 18 memakai verified account, relationship declaration, dan explicit consent.
- Ticket limit maksimal 10 per order dan 5 active tickets per verified Identity per Event; transfer tetap tidak tersedia.
- Biteship memakai approved domestic service allowlist, live quote, organization-paid shipping, dan KREW-approved reshipment.
- Primary store RPO 15 menit, RTO 4 jam, backup 7/14/35 hari untuk development/staging/production, restore drill quarterly, dan cross-region DR ditunda.
- Browser production memakai secure HttpOnly SameSite cookie melalui API gateway/identity-aware path; anonymous Cloud Run invocation ditolak.
- Baseline operasional: 99.9% monthly availability, standard pilot 50 organization/100 active event/25.000 ticket per hari, 100 device, 200 concurrent scans, WCAG 2.2 AA, dan acknowledgement support P1/P2/P3 15 menit/1 jam/1 business day; target containment dan resolution dijelaskan di RUNBOOK.
- Nilai TBD yang tersisa dikelola terpusat di [OPEN-DECISIONS.md](../00-governance/OPEN-DECISIONS.md), dan mencakup account/contract reference, konfigurasi provider, legal wording/statutory interpretation, named roster, GCP sizing/quotas/budget/CMEK, venue-specific physical parameters, pilot identity/schedule, serta phase-exit evidence. Tidak ada TBD yang boleh diam-diam diubah menjadi implementation assumption.

## 1. Gambaran Umum

**KROWDS** adalah platform **B2B2C SaaS terintegrasi** yang membantu pengelola event, attraction, playground, dan bisnis berbasis kunjungan dalam mengelola ticketing, pembayaran, wristband, pengunjung, serta kontrol akses melalui satu sistem.

KROWDS mencakup berbagai proses operasional, antara lain:

- pemesanan dan pengelolaan wristband;
- penjualan tiket secara online maupun melalui kasir;
- pembayaran;
- penerbitan e-ticket;
- registrasi dan verifikasi pengunjung;
- penukaran e-ticket;
- binding wristband;
- distribusi dan aktivasi wristband;
- pengelolaan hak akses atau entitlement;
- kontrol akses pengunjung; serta
- pencatatan dan audit aktivitas operasional.

Melalui KROWDS, pengelola dapat melakukan pemesanan wristband sesuai kebutuhan operasional. Setelah wristband diterima dan batch diaktifkan, wristband dapat digunakan untuk mendukung penjualan tiket, registrasi pengunjung, penukaran e-ticket, binding dengan tiket dan identitas, serta pemberian hak akses kepada pengunjung yang telah tervalidasi.

Pengelola dapat menjual tiket secara langsung melalui kasir maupun menjual **e-ticket secara online melalui website**. E-ticket yang dibeli secara online dapat ditukarkan dengan wristband di lokasi sebagai bukti kepemilikan tiket dan credential akses yang sah.

Seluruh proses dilakukan secara digital dan terintegrasi sehingga transaksi, pembayaran, perubahan data, penerbitan tiket, penggunaan wristband, serta aktivitas akses dapat dicatat, ditelusuri, dan dipertanggungjawabkan.

KROWDS mendukung metode pembayaran berikut pada MVP:

- **QRIS** untuk transaksi melalui kasir; serta
- **QRIS, Virtual Account, dan e-wallet yang didukung Xendit** untuk transaksi online.

Metode card, mata uang non-IDR, dan metode pembayaran lain di luar daftar tersebut tidak tersedia pada MVP.

Dengan sistem yang terintegrasi, KROWDS membantu pengelola meningkatkan transparansi operasional sekaligus meminimalkan risiko dan potensi kecurangan, baik yang berasal dari pihak eksternal maupun internal.

Risiko eksternal yang dapat diminimalkan antara lain:

- percaloan;
- penipuan tiket;
- tiket atau wristband palsu;
- duplikasi tiket;
- penggunaan tiket secara berulang;
- manipulasi QR Code; dan
- penyalahgunaan akses oleh pihak yang tidak berhak.

Dari sisi internal, KROWDS membantu mengurangi risiko seperti:

- transaksi yang tidak tercatat atau tidak transparan;
- pencatatan yang sulit diaudit;
- manipulasi transaksi;
- penyalahgunaan refund;
- penyalahgunaan hak akses oleh staf;
- aktivasi atau penggantian wristband tanpa otorisasi;
- perubahan data tanpa kewenangan; serta
- ketergantungan terhadap proses manual.

Secara keseluruhan, KROWDS mengintegrasikan proses mulai dari **registrasi pengguna, onboarding pengelola, pengelolaan tim, pemesanan wristband, penjualan tiket, pembayaran, penerbitan e-ticket, verifikasi identitas, penukaran tiket, binding wristband, hingga kontrol akses** dalam satu sistem yang lebih **aman, transparan, terukur, terintegrasi, dan mudah diaudit**.

---

# 2. Aktor Utama

KROWDS memiliki beberapa jenis pengguna dengan fungsi dan kewenangan yang berbeda di dalam platform.

## 2.1 Pengguna / Pengunjung

**Pengguna** adalah individu yang menggunakan KROWDS untuk:

- mencari event, attraction, playground, atau aktivitas lainnya;
- membeli tiket;
- mengelola e-ticket;
- melakukan penukaran e-ticket; serta
- menggunakan wristband untuk mendapatkan akses masuk.

## 2.2 Pengelola

**Pengelola** adalah organisasi, perusahaan, event organizer, operator venue, atau pihak lain yang menggunakan KROWDS sebagai sistem operasional untuk mengelola:

- tiket;
- pembayaran;
- wristband;
- pengunjung;
- tim operasional; dan
- kontrol akses.

## 2.3 Tim Pengelola

**Tim Pengelola** adalah individu yang bekerja untuk atau ditunjuk oleh Pengelola untuk menjalankan fungsi operasional tertentu.

Fungsi tersebut dapat mencakup:

- administrator;
- kasir;
- ticketing;
- redemption;
- gate;
- finance; atau
- fungsi operasional lainnya.

Setiap anggota Tim Pengelola menggunakan akun individual dengan role dan permission sesuai kewenangannya.

## 2.4 KREW

**KREW** adalah tim internal KROWDS yang bertanggung jawab terhadap operasional platform, termasuk:

- verifikasi Pengelola;
- verifikasi pesanan wristband;
- persiapan produksi;
- produksi;
- quality control;
- fulfillment;
- pengiriman; serta
- fungsi operasional internal lainnya.

---

# 3. Pendaftaran Pengguna

Pengguna dapat membuat akun melalui halaman **Daftar** dengan memasukkan:

- nama lengkap;
- alamat email; dan
- password.

Pengguna juga dapat melakukan pendaftaran menggunakan akun Google.

Untuk pendaftaran menggunakan email, Pengguna wajib melakukan verifikasi melalui kode OTP yang dikirimkan ke alamat email yang digunakan saat pendaftaran.

Setelah akun berhasil dibuat, Pengguna diarahkan untuk melengkapi profil dengan data identitas berupa:

- jenis identitas;
- nomor identitas; dan
- nama lengkap sesuai identitas.

Sistem melakukan validasi terhadap data identitas untuk memastikan identitas dapat digunakan sesuai ketentuan platform serta mencegah duplikasi yang melanggar aturan penggunaan.

Setelah proses tersebut selesai, Pengguna dapat mengakses halaman **Jelajah** untuk mencari dan membeli tiket event, attraction, playground, atau aktivitas lainnya yang tersedia di KROWDS.

---

# 4. Pendaftaran dan Onboarding Pengelola

Pengelola dapat melakukan pendaftaran melalui halaman **Daftar** dengan memilih opsi **Daftar sebagai Pengelola**.

Pengelola kemudian membuat akun dengan memasukkan:

- nama organisasi;
- alamat email; dan
- password.

Pengelola wajib melakukan verifikasi email menggunakan kode OTP yang dikirimkan melalui email.

Setelah akun berhasil dibuat, Pengelola diarahkan ke halaman **Onboarding Organisasi**.

## 4.1 Informasi Organisasi

Pengelola wajib melengkapi informasi organisasi berikut:

- jenis organisasi;
- nama organisasi;
- alamat lengkap;
- kota atau kabupaten;
- provinsi;
- kode pos; dan
- website apabila tersedia sebagai informasi tambahan.

Legal entity, registration, representative, tax ID, address, bank verification, dan authorized signatory wajib tersedia sebelum organization dapat disetujui. Data yang belum lengkap dapat disimpan sebagai Draft atau dikembalikan sebagai Revision Required.

## 4.2 Data Legalitas

Pengelola wajib melengkapi data legalitas berikut:

- NIB;
- NPWP Badan;
- nomor Akta Pendirian;
- nomor SK Kemenkumham;
- dokumen NIB; dan
- dokumen NPWP.

## 4.3 Data Penanggung Jawab

Data penanggung jawab wajib mencakup:

- nama lengkap;
- nomor telepon;
- alamat email;
- identitas KTP; dan
- hubungan atau kewenangan terhadap organisasi.

Hubungan atau kewenangan tersebut dapat berupa:

- direktur;
- pemilik;
- manajer; atau
- PIC resmi.

## 4.4 Informasi Keuangan

Pengelola wajib melengkapi informasi keuangan berikut:

- nama bank;
- nomor rekening;
- nama pemilik rekening; dan
- bukti rekening atau buku tabungan sebagai bagian dari bank verification.

## 4.5 Persetujuan

Sebelum proses onboarding dikirimkan, Pengelola wajib memberikan persetujuan terhadap:

- Terms & Conditions;
- Privacy Policy;
- Perjanjian Penggunaan KROWDS;
- persetujuan pemrosesan data; serta
- pernyataan bahwa seluruh informasi yang diberikan adalah benar.

## 4.6 Verifikasi Onboarding

Setelah onboarding dikirimkan, KROWDS melakukan proses verifikasi.

Status onboarding dapat berupa:

**Draft → Submitted → Under Review → Revision Required → Approved / Rejected**

Apabila terdapat data atau dokumen yang belum sesuai, KREW dapat mengembalikan onboarding dengan status **Revision Required** disertai catatan mengenai informasi yang perlu diperbaiki.

Pengelola memperoleh akses penuh terhadap fitur operasional setelah organisasi berhasil diverifikasi dan berstatus **Approved**.

---

# 5. Pengelolaan Tim

Setiap anggota Tim Pengelola wajib memiliki akun individual di KROWDS.

Pengelola dapat mengundang anggota tim menggunakan **invitation link** yang terhubung dengan organisasi serta role tertentu.

Apabila penerima invitation belum memiliki akun KROWDS, pengguna akan diarahkan terlebih dahulu ke halaman pendaftaran. Setelah proses pendaftaran selesai, pengguna dapat melanjutkan proses penerimaan invitation.

Apabila pengguna telah memiliki akun, pengguna cukup melakukan login dan menerima invitation tersebut.

Setelah invitation diterima, anggota tim dapat mengakses dashboard organisasi sesuai dengan **role dan permission** yang diberikan oleh Pengelola.

Dengan mekanisme ini:

- akun tetap dimiliki secara individual oleh masing-masing pengguna; dan
- kewenangan terhadap organisasi dikelola secara terpisah melalui role dan permission.

---

# 6. Pembelian E-Ticket

Pengguna mengakses halaman **Jelajah**, kemudian memilih event, attraction, playground, atau aktivitas yang diinginkan.

Pengguna memilih jenis tiket yang tersedia dan menentukan **Pemegang Tiket** untuk setiap tiket yang dibeli.

Data Pemegang Tiket terdiri atas:

- nama lengkap;
- jenis identitas; dan
- nomor identitas.

KROWDS membedakan antara **Pembeli** dan **Pemegang Tiket**.

Satu Pengguna dapat membeli tiket untuk dirinya sendiri maupun untuk beberapa orang lain. Namun, setiap tiket harus memiliki satu Pemegang Tiket yang teridentifikasi dengan jelas.

Prinsip dasarnya adalah:

**1 Ticket = 1 Ticket Holder = 1 Identity**

Pembatasan penggunaan identitas pada MVP adalah:

- maksimal 5 tiket aktif per verified Identity per Event;
- maksimal 1 tiket aktif untuk kombinasi Event + Ticket Product + Session yang sama;
- tiket dianggap aktif setelah paid dan belum berstatus Refunded, Cancelled, Expired, atau Used; dan
- tidak ada exception uniqueness pada MVP.

Dengan demikian, satu identity dapat memiliki beberapa tiket aktif untuk Event yang sama apabila combination produk/session berbeda, tetapi tidak dapat memiliki tiket aktif ganda untuk combination yang sama.

Setelah seluruh data selesai diisi, Pengguna melakukan pembayaran menggunakan salah satu metode online MVP:

- QRIS;
- Virtual Account; atau
- e-wallet yang didukung Xendit.

Setelah KROWDS menerima konfirmasi pembayaran berhasil dari payment provider, sistem menerbitkan e-ticket.

E-ticket dapat:

- diakses melalui dashboard Pengguna;
- diunduh oleh Pengguna; dan
- dikirimkan melalui channel komunikasi yang tersedia.

Setiap e-ticket memiliki identifier dan QR Code unik yang dapat diverifikasi oleh sistem.

E-ticket berfungsi sebagai:

- bukti kepemilikan tiket; dan
- dasar proses penukaran tiket menjadi wristband di lokasi.

---

# 7. Penukaran E-Ticket Menjadi Wristband

Pengguna datang ke lokasi dengan membawa:

- e-ticket; dan
- identitas fisik yang sesuai dengan data Pemegang Tiket.

Petugas penukaran melakukan scan terhadap QR Code pada e-ticket.

Sistem kemudian menampilkan informasi yang dapat mencakup:

- identitas tiket;
- data Pemegang Tiket;
- status pembayaran;
- validitas tiket;
- event atau activity terkait; dan
- status penukaran tiket.

Petugas membandingkan data pada sistem dengan identitas fisik yang diberikan oleh Pengguna.

Apabila:

- data identitas sesuai;
- tiket masih valid; dan
- tiket belum pernah ditukarkan,

petugas melakukan scan terhadap QR Code pada wristband yang akan diberikan.

Sistem kemudian melakukan binding:

**Identity → Ticket → Wristband**

Setelah proses binding berhasil, wristband diaktifkan sesuai entitlement atau hak akses yang dimiliki tiket.

Identitas fisik dikembalikan kepada Pengguna dan wristband diberikan untuk digunakan sebagai credential akses yang sah.

Setiap proses penukaran dicatat oleh sistem, termasuk informasi mengenai:

- waktu;
- lokasi;
- petugas;
- tiket; dan
- wristband yang digunakan.

---

# 8. Penjualan Tiket Melalui Kasir

Selain membeli tiket secara online, Pengunjung dapat membeli tiket secara langsung melalui kasir di lokasi.

Petugas kasir memilih:

- jenis tiket; dan
- jumlah tiket yang dibutuhkan.

Untuk setiap tiket, kasir memasukkan data Pemegang Tiket berupa:

- jenis identitas;
- nomor identitas; dan
- nama lengkap.

Setelah data Pemegang Tiket tervalidasi, kasir memilih wristband dari inventory yang berstatus `Available` dan membuatnya berstatus `Reserved`.

Sistem kemudian membuat transaksi dan menghasilkan instruksi pembayaran berdasarkan metode Xendit yang dipilih. Untuk MVP, transaksi kasir menggunakan QRIS.

Wristband belum dapat digunakan sebelum sistem menerima konfirmasi pembayaran yang valid dari Xendit.

Alur dasarnya adalah:

**Wristband Reserved → Transaction Created → Payment Pending → Payment Confirmed → Ticket Issued → Wristband Bound → Wristband Active**

Setelah pembayaran berhasil, kasir dapat mencetak struk transaksi dan memberikan wristband kepada Pengunjung. Wristband tersebut selanjutnya digunakan sebagai credential akses yang sah.

Jika wristband berasal dari batch produksi, wristband hanya dapat dipilih setelah batch selesai diproduksi, quality control, dikirim, diterima, dan diaktifkan oleh Pengelola.

---

# 9. Kontrol Akses

Pengunjung menuju gate atau pintu masuk menggunakan wristband aktif.

Petugas melakukan scan terhadap QR Code pada wristband.

KROWDS kemudian memvalidasi status wristband beserta hak akses atau entitlement yang terhubung dengannya.

Validasi dapat mencakup:

- status wristband;
- event atau activity;
- venue;
- tanggal;
- session;
- waktu akses;
- status entitlement `unused` atau `consumed`;
- entitlement; serta
- aturan akses dan anti-replay.

Apabila seluruh persyaratan terpenuhi, sistem memberikan status:

**Access Granted**

Pengunjung kemudian diperbolehkan masuk.

Apabila wristband:

- tidak valid;
- belum aktif;
- diblokir;
- telah kedaluwarsa;
- telah digunakan di luar ketentuan; atau
- tidak memiliki entitlement terhadap lokasi atau aktivitas tersebut,

sistem memberikan status:

**Access Denied**

Sistem juga menampilkan alasan penolakan agar petugas dapat mengetahui penyebab akses ditolak.

Setiap aktivitas scan dicatat sebagai **Access Log**.

---

# 10. Pemesanan Wristband oleh Pengelola

Pengelola dapat melakukan pemesanan wristband melalui halaman **Order** pada dashboard Pengelola.

Dalam pembuatan pesanan, Pengelola dapat menentukan:

- venue atau activity;
- jenis tiket, apabila diperlukan;
- jenis wristband;
- material wristband;
- jumlah pesanan; dan
- artwork.

Apabila desain wristband berbeda berdasarkan jenis tiket atau kategori akses, Pengelola dapat menghubungkan desain tersebut dengan tiket atau activity terkait.

Pengelola dapat menambahkan beberapa item wristband dalam satu pesanan untuk venue, activity, desain, atau kebutuhan operasional yang berbeda.

Setelah seluruh item pesanan selesai, Pengelola melengkapi:

- informasi billing;
- informasi shipping;
- metode pengiriman; dan
- metode pembayaran.

Setelah pembayaran berhasil, pesanan diteruskan kepada **KREW** untuk diproses.

---

# 11. Pemrosesan Pesanan oleh KREW

KREW menerima pesanan melalui dashboard internal KROWDS.

KREW melakukan verifikasi terhadap:

- detail pesanan;
- jumlah wristband;
- material;
- artwork;
- venue atau activity terkait; dan
- kebutuhan produksi lainnya.

Apabila artwork atau data pesanan belum sesuai dengan spesifikasi produksi, KREW dapat mengembalikan pesanan dengan status:

**Revision Required**

KREW memberikan catatan atau rekomendasi revisi kepada Pengelola.

Apabila seluruh informasi telah sesuai, pesanan dapat dilanjutkan ke proses produksi.

KROWDS kemudian menghasilkan identifier unik untuk setiap wristband yang akan diproduksi.

---

# 12. File Produksi Wristband

Untuk mendukung proses produksi, KROWDS menghasilkan file berformat `.csv`.

Setiap baris pada file merepresentasikan satu wristband.

File produksi memiliki schema version dan disimpan secara private di Cloud Storage. Setiap baris merepresentasikan satu wristband dan minimal terdiri atas:

- `batch_id`
- `wristband_code`
- `qr_payload`
- `schema_version`

Contoh synthetic:

```csv
batch_id,wristband_code,qr_payload,schema_version
WB-BATCH-001,KWX-WB01-GDH3BDH8,c3ludGhldGljLXRva2VuLTEyOA,1
WB-BATCH-001,KWX-WB01-K7HF2PL9,c3ludGhldGljLXRva2VuLTI0OA,1
WB-BATCH-001,KWX-WB01-MP4K8XQ2,c3ludGhldGljLXRva2VuLTM2OA,1
```

Contoh tersebut tidak boleh digunakan sebagai credential production atau seed data. File tidak dapat dipublikasikan sebagai public asset. Batch Activation Code dikirim melalui dashboard terautentikasi dan email, tidak disertakan dalam CSV.

`wristband_code` digunakan sebagai identifier visual dan dicetak dalam bentuk **plain text** pada wristband.

Sementara itu, `qr_payload` dikonversi menjadi **QR Code** dan dicetak pada wristband.

Dengan demikian, satu wristband secara fisik dapat memiliki:

**Plain Text**

`KWX-WB01-GDH3BDH8`

dan:

**QR Code**

yang merepresentasikan:

`c3ludGhldGljLXRva2VuLTEyOA`

Data pribadi Pengguna tidak dimasukkan ke dalam file produksi wristband.

File produksi tidak perlu memuat:

- nama customer;
- nomor identitas;
- data Pemegang Tiket;
- informasi pembayaran;
- entitlement;
- data akses; atau
- informasi pribadi lainnya.

Hal tersebut karena pada tahap produksi wristband belum terhubung dengan Pengguna tertentu.

---

# 13. Identitas Wristband

Setiap wristband memiliki dua identifier utama dengan fungsi yang berbeda:

1. **Wristband Code**
2. **QR Payload**

## 13.1 Wristband Code

`wristband_code` merupakan identifier visual yang dicetak dalam bentuk plain text pada wristband.

Contoh:

`KWX-WB01-GDH3BDH8`

Kode tersebut dapat digunakan untuk membantu proses:

- identifikasi;
- pencarian;
- troubleshooting;
- stock management; dan
- operasional manual.

Format Wristband Code dapat terdiri atas:

**Initial → Batch → Unique Code**

Contoh:

`KWX-WB01-GDH3BDH8`

Dengan struktur:

- `KWX` dapat menjadi inisial venue atau activity;
- `WB01` merupakan kode batch; dan
- `GDH3BDH8` merupakan kode unik alfanumerik.

Inisial dapat dibuat secara otomatis oleh sistem berdasarkan venue atau activity. Panjang maksimum, algoritma pembuatan, dan aturan collision handling belum ditetapkan; keputusan tersebut dikendalikan oleh `KROWDS-OD-028` dan harus disetujui sebelum produksi fisik. [DATA-MODEL.md](../04-domain/DATA-MODEL.md) hanya menetapkan uniqueness dalam organisasi.

## 13.2 QR Payload

`qr_payload` merupakan credential digital yang dikonversi menjadi QR Code. Nilainya adalah token base64url tanpa padding yang tidak memiliki prefix, ID, atau data domain yang dapat diprediksi.

Contoh berikut adalah **synthetic documentation example** dan tidak pernah menjadi credential yang valid:

`c3ludGhldGljLXRva2VuLTEyOA`

Token yang terdapat di dalam QR Payload:

- dibuat secara acak dengan entropy minimal 128 bit;
- tidak berurutan dan tidak memiliki pola yang mudah ditebak;
- hanya disimpan dalam bentuk hash pada database;
- dapat dicabut ketika wristband di-disable atau di-revoke;
- dapat digunakan untuk proses redemption terotorisasi ketika wristband berstatus `Available` atau `Reserved`, tetapi hanya access-valid ketika wristband berstatus `Active` dan entitlement masih berlaku; dan
- tidak dapat digunakan untuk memperoleh akses secara langsung tanpa validasi server.

QR Code tidak menyimpan secara langsung informasi seperti:

- nama Pengguna;
- nomor identitas;
- tiket;
- venue atau activity;
- harga;
- pembayaran;
- entitlement; atau
- informasi pribadi lainnya.

QR Code hanya berfungsi sebagai credential untuk menemukan record wristband terkait di dalam sistem KROWDS.

Secara sederhana:

**Wristband Code = Human-Readable Identifier**

**QR Payload = Machine-Readable Credential**

Keduanya merepresentasikan wristband yang sama dan terhubung ke record yang sama di dalam sistem.

---

# 14. Produksi dan Pengiriman Wristband

Setelah file produksi dan artwork siap, KREW melanjutkan proses produksi.

Tahapan pesanan dapat mencakup:

**Paid → Payment Verified → Production → Quality Control → Label Created → Picked Up → Shipped → Delivered (verified Biteship evidence + organization receipt) → Batch Activated**

`Label Created` dan `Picked Up` adalah state pada shipment projection; order/batch masuk `shipped` hanya setelah carrier handoff terverifikasi. Quality failure dapat memindahkan order atau batch ke `Quarantined`; resolution dapat berupa production rework atau `Void`.

File produksi, artwork, dan dokumen organisasi disimpan secara private di Cloud Storage. Setelah quality control selesai, KROWDS membuat label dan tracking shipment melalui Biteship. Status `shipped` hanya dicatat setelah carrier handoff atau pickup terverifikasi; status pengiriman berikutnya diproses melalui webhook Biteship yang diverifikasi dan diaudit.

Setelah produksi selesai, KREW melakukan quality control untuk memastikan:

- jumlah wristband;
- artwork;
- Wristband Code;
- QR Code; dan
- hasil produksi

telah sesuai dengan pesanan.

Pesanan kemudian dikemas dan dikirimkan menggunakan metode pengiriman yang dipilih oleh Pengelola. Jika terjadi kegagalan atau pembatalan yang disetujui, fulfilment dapat masuk ke state `Reshipment Pending`; KROWDS membuat percobaan pengiriman pengganti yang idempotent dan mempertahankan histori shipment asli.

---

# 15. Aktivasi Batch Wristband

Wristband yang telah selesai diproduksi tidak langsung dapat digunakan.

Wristband tetap berada dalam kondisi belum aktif selama:

- proses produksi;
- quality control;
- pengiriman; dan
- sebelum diterima oleh Pengelola.

Setelah pesanan diterima, Pengelola melakukan konfirmasi penerimaan melalui dashboard.

Pengelola kemudian memasukkan **Batch Activation Code**.

Apabila Batch Activation Code berhasil diverifikasi, seluruh wristband dalam batch tersebut berubah menjadi tersedia untuk digunakan. Kode dikirim melalui dashboard terautentikasi dan transactional email Resend; kode tidak pernah dimasukkan ke file CSV atau QR Code produksi.

Status wristband menjadi:

**Available**

Setelah berstatus Available, wristband dapat mulai digunakan dalam proses binding.

Mekanisme ini membantu memastikan bahwa wristband yang hilang atau dicuri selama proses produksi maupun pengiriman belum dapat digunakan sebagai credential akses.

---

# 16. Lifecycle Wristband

KROWDS membedakan antara wristband dari inventory yang sudah tersedia dan wristband dari batch produksi baru.

## 16.1 Stock Wristband

Lifecycle stock wristband:

**Available**  
↓  
**Reserved**  
↓  
**Bound**  
↓  
**Active**  
↓  
**Used / Expired / Disabled / Revoked**

Quality issue dapat memindahkan unit ke `Quarantined`; unit tidak dapat dialokasikan atau digunakan sebelum ada resolusi yang berwenang.

Wristband dapat di-reserve sebelum pembayaran. Wristband hanya menjadi `Active` setelah pembayaran, binding, dan entitlement tervalidasi.

## 16.2 Newly Produced Batch

Lifecycle batch produksi:

**Generated**  
↓  
**Production**  
↓  
**Quality Control**  
↓  
**Shipped**  
↓  
**Delivered**  
↓  
**Batch Activated**  
↓  
**Available**  
↓  
**Reserved**  
↓  
**Bound**  
↓  
**Active**  
↓  
**Used / Expired / Disabled / Revoked**

Quality issue dapat memindahkan batch ke `Quarantined`, lalu diproses melalui production rework atau `Void`; individual unit dapat dipindahkan ke `Revoked`.

Wristband produksi tidak dapat dipilih atau diaktifkan sebelum batch diterima dan diaktifkan.

## 16.3 Generated

Record wristband beserta credential-nya telah dibuat oleh KROWDS.

## 16.4 Production

Wristband sedang berada dalam proses produksi.

## 16.5 Quality Control

KROWDS memverifikasi jumlah, artwork, Wristband Code, QR Code, dan hasil produksi.

## 16.6 Shipped

Batch telah diserahkan kepada Biteship dan memiliki tracking shipment.

## 16.7 Delivered

Batch memiliki verified delivery evidence dari Biteship dan organization telah mengonfirmasi receipt secara autentik. Batch belum boleh diaktifkan sebelum kedua bukti tersebut tersedia.

## 16.8 Batch Activated

Pengelola telah memberikan Batch Activation Code yang valid.

## 16.9 Available

Wristband siap dipilih untuk proses binding.

## 16.10 Reserved

Wristband dikunci untuk transaksi atau redemption tertentu.

## 16.11 Bound

Wristband telah terhubung dengan tiket dan identitas Pemegang Tiket.

## 16.12 Active

Wristband memiliki entitlement yang valid dan dapat digunakan sebagai credential akses.

## 16.13 Used / Expired / Disabled / Revoked

Wristband telah digunakan, masa berlakunya telah berakhir, atau aksesnya dicabut oleh sistem atau authority yang berwenang.

---

# 17. Binding Wristband

Wristband hanya dapat di-binding apabila berada dalam status yang diperbolehkan oleh sistem.

Binding membentuk hubungan:

**Identity → Ticket → Wristband → Access Entitlement**

Dengan mekanisme ini, wristband yang belum di-binding belum memiliki identitas Pemegang Tiket maupun hak akses tertentu.

Pada saat proses binding berhasil, sistem menyimpan hubungan antara:

- Pemegang Tiket;
- tiket;
- wristband;
- event atau activity;
- entitlement; dan
- informasi terkait lainnya.

---

# 18. Sistem Pembayaran

Xendit merupakan source of truth untuk status pembayaran KROWDS. KROWDS menggunakan IDR dan tidak menyimpan raw card data.

## 18.1 Transaksi Online

Metode pembayaran MVP:

- QRIS;
- Virtual Account; dan
- e-wallet yang didukung Xendit.

Harga catalog ditampilkan dalam IDR dan sudah termasuk pajak sesuai kebijakan bisnis yang berlaku. Tidak ada platform fee KROWDS terpisah pada MVP; Xendit fee merupakan organization pass-through operating cost. Payment expiry dikonfigurasi di backend dan tidak boleh digantikan oleh konfirmasi manual.

## 18.2 Transaksi di Lokasi

Transaksi melalui kasir menggunakan **QRIS** dan tetap mengambil status pembayaran dari Xendit. Metode pembayaran digital lainnya tidak ditampilkan atau diterima dalam alur Cashier MVP.

Setiap callback Xendit harus:

- diverifikasi menggunakan secret/webhook verification;
- diproses secara idempotent;
- menyimpan provider event ID dan request ID;
- memiliki retry/replay protection; dan
- diaudit.

Refund MVP bersifat full refund. User atau staf authorized dapat mengajukan request dalam 7 hari kalender setelah payment verified dan sebelum ticket Bound/Used; Finance atau Organization Admin melakukan approval dan submission ke Xendit. Request setelah 7 hari masuk ke state `exceptional_review` dan memerlukan keputusan Finance dengan dual approval sebelum provider submission. Hanya verified Xendit result yang mengubah status final. Jika Xendit refund gagal, order tetap berada pada refund failure/reconciliation state dan tidak mengembalikan ticket secara otomatis. Settlement SLA, reconciliation age, dan escalation ownership dikendalikan oleh `KROWDS-OD-027`; detail legal Xendit tetap `TBD — Xendit/legal review`.

Prinsip dasarnya adalah:

**Payment Confirmation from Xendit → Ticket Valid → Wristband Reservation/Binding sesuai alur → Wristband Active setelah binding dan entitlement tervalidasi**

---

# 19. Transparansi dan Audit Operasional

Seluruh aktivitas penting dalam KROWDS dicatat secara digital.

Aktivitas yang dicatat dapat mencakup:

- pendaftaran;
- perubahan profil;
- onboarding organisasi;
- approval organisasi;
- pembuatan transaksi;
- pembayaran;
- penerbitan tiket;
- penukaran tiket;
- binding wristband;
- aktivasi batch;
- aktivitas kasir;
- refund;
- pembatalan;
- akses masuk;
- perubahan role atau permission; serta
- aktivitas penting lainnya.

Setiap aktivitas dapat ditelusuri berdasarkan informasi seperti:

- pengguna atau pihak yang melakukan aktivitas;
- jenis aktivitas;
- waktu aktivitas;
- organisasi;
- lokasi;
- transaksi terkait; dan
- data relevan lainnya.

Pencatatan tersebut membentuk **audit trail** yang dapat digunakan untuk kebutuhan pemantauan, pemeriksaan, investigasi, dan pertanggungjawaban operasional.

---

# 20. Pencegahan Risiko Eksternal

KROWDS dirancang untuk membantu meminimalkan risiko yang berasal dari pihak eksternal, seperti:

- percaloan;
- penipuan tiket;
- tiket palsu;
- wristband palsu;
- duplikasi tiket;
- penggunaan tiket secara berulang;
- penggunaan tiket oleh pihak yang tidak berhak;
- manipulasi QR Code; dan
- akses tanpa entitlement yang sah.

Verifikasi tiket, identitas, wristband, dan entitlement dilakukan melalui sistem KROWDS sebelum akses diberikan.

---

# 21. Pencegahan Risiko Internal

KROWDS juga membantu mengurangi risiko internal, seperti:

- transaksi yang tidak tercatat;
- pembayaran yang tidak transparan;
- manipulasi transaksi;
- penyalahgunaan refund;
- penyalahgunaan hak akses;
- aktivasi wristband yang tidak sah;
- penggantian wristband tanpa otorisasi;
- perubahan data tanpa kewenangan;
- penyalahgunaan akses oleh staf;
- ketergantungan terhadap proses manual; serta
- aktivitas yang sulit diaudit atau dipertanggungjawabkan.

Penggunaan **role, permission, approval, dan audit trail** membantu membatasi aktivitas sensitif berdasarkan kewenangan masing-masing pengguna.

---

# 22. Prinsip Utama KROWDS

KROWDS dibangun berdasarkan beberapa prinsip utama.

## Digital

Mengurangi ketergantungan terhadap proses manual dengan mendigitalisasi aktivitas operasional utama.

## Integrated

Menghubungkan ticketing, payment, identity, wristband, dan access control melalui satu sistem.

## Traceable

Setiap aktivitas penting dapat ditelusuri kembali.

## Accountable

Setiap aktivitas dapat dikaitkan dengan pengguna atau pihak yang bertanggung jawab.

## Secure

Credential tiket dan wristband divalidasi melalui sistem sebelum digunakan.

## Auditable

Transaksi dan aktivitas dapat diperiksa kembali apabila diperlukan.

## Scalable

Sistem dapat digunakan oleh berbagai jenis Pengelola, event, venue, attraction, dan playground dengan skala serta kebutuhan operasional yang berbeda.

---

# 23. Rangkaian Utama KROWDS

Secara keseluruhan, KROWDS menghubungkan beberapa rangkaian proses utama.

## 23.1 Pengguna

**Registration**  
→ **Identity**  
→ **Explore**  
→ **Purchase**  
→ **Payment**  
→ **E-Ticket**  
→ **Verification**  
→ **Wristband Binding**  
→ **Access**

## 23.2 Pengelola

**Registration**  
→ **Onboarding**  
→ **Verification**  
→ **Organization Dashboard**  
→ **Team Management**  
→ **Ticket Sales**  
→ **Wristband Management**  
→ **Visitor Management**  
→ **Access Control**

## 23.3 Wristband

**Order**  
→ **Payment**  
→ **KREW Verification**  
→ **Production**  
→ **Quality Control**  
→ **Shipping**  
→ **Delivery**  
→ **Batch Activation**  
→ **Available**  
→ **Binding**  
→ **Active**  
→ **Access**

## 23.4 KREW

**Order Received**  
→ **Verification**  
→ **Production Preparation**  
→ **QR & Identifier Generation**  
→ **Quality Control**  
→ **Fulfillment**  
→ **Shipping**  
→ **Operational Oversight**

---

# 24. Kesimpulan

KROWDS berfungsi sebagai platform terintegrasi yang menghubungkan **ticketing, payment, identity, wristband, visitor management, dan access control** dalam satu ekosistem operasional.

Melalui integrasi tersebut, seluruh pihak yang terlibat—Pengguna, Pengelola, Tim Pengelola, dan KREW—dapat menjalankan aktivitasnya melalui proses yang lebih terstruktur, aman, transparan, terukur, dapat ditelusuri, dan dapat dipertanggungjawabkan.

KROWDS tidak hanya berfungsi sebagai sistem penjualan tiket, tetapi sebagai **infrastruktur operasional end-to-end** untuk pengelolaan kunjungan, transaksi, identitas, wristband, dan akses.