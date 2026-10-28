# DARCHA v3 — საჯარო განცხადებების საიტი, უფასო გეგმებით

**დაწყებისთვის საჭირო სერვისები:** GitHub Pages (საიტი), Firebase **Spark** (Auth + Firestore), Cloudinary **Free** (ფოტოები), Cloudflare **Workers Free** (დაცული ფოტო-პროქსი). ამ სქემაში Firebase Storage საერთოდ არ გამოიყენება და Blaze არ არის საჭირო. უფასო ლიმიტების გადაჭარბებისას სერვისები შეიძლება შეიზღუდოს; ყოველთვიურ მოხმარებას აკონტროლე თითოეული სერვისის Dashboard-ში.

საიტი მუშაობს **ქართულ, ინგლისურ და რუსულ** ენებზე. მნახველები თავისუფლად ათვალიერებენ განცხადებებს; ფოტოსა და განცხადების დასამატებლად საჭიროა ანგარიშზე შესვლა. მომხმარებელი თავად მართავს თავის განცხადებებს. **ჯერ არ არის გაკეთებული ადმინის პანელი, მოდერაცია, რეპორტის სისტემა ან რეალური ტრანზაქციები** — საჯარო სარეკლამო კამპანიამდე ეს საკითხები საჭიროა.

## ნაბიჯი 1 — GitHub Pages (შესაძლებელია პირველადვე)

1. გადმოწერე DARCHA v3 ZIP და ამოარქივე.
2. GitHub-ში გახსენი უკვე შექმნილი `darcha` რეპოზიტორია; ატვირთე ZIP-ში არსებული ფაილები და `assets` საქაღალდე, ისე რომ `index.html` იყოს ზედა დონეზე. **ZIP ერთ ფაილად არ ატვირთო**.
3. GitHub → `Settings > Pages > Deploy from branch`, აირჩიე `main / (root)` და `Save` (თუ უკვე გააკეთე, გამეორება არ არის საჭირო).
4. მისამართი იქნება `https://USERNAME.github.io/darcha/`.
5. `cloudflare-worker` საქაღალდე საიტის ფუნქციონირებისთვის საჭირო არ არის; ესაა ცალკე Cloudflare-ში დასაკოპირებელი სერვერის კოდი (შეგიძლია GitHub-შიც გქონდეს; საიდუმლო გასაღებები იქ **არ** წერია).

**სანამ Firebase არაა დაკავშირებული:** საიტი მუშაობს დემო რეჟიმში, გამოგონილი განცხადებებით. დემოში დამატებული განცხადებები მხოლოდ შენს ბრაუზერშია.

## ნაბიჯი 2 — Firebase Spark (გადასახადის გარეშე)

1. გახსენი https://console.firebase.google.com/ და შექმენი **ახალი, ცალკე Firebase პროექტი**: `darcha` (Domino Georgia-ს პროექტს არ შეეხო). დატოვე გეგმა `Spark`.
2. `Project overview > Web (</>)` → Web App რეგისტრაცია. გამოჩნდება `firebaseConfig`.
3. GitHub-ზე `config.js`-ში ჩასვი Firebase-ის `apiKey`, `authDomain`, `projectId`, `appId` შესაბამის მნიშვნელობებში. ეს კონფიგურაცია საჯარო Web App მონაცემებია; **სერვის-ანგარიშის JSON / private key არ ჩასვა**.
4. `Authentication > Sign-in method`: ჩართე **Google** და **Email/Password**. `Authentication > Settings > Authorized domains`: დაუმატე `USERNAME.github.io` (მხოლოდ დომენი, არ ჩაწერო `/darcha`). Google Provider-ში აირჩიე მხარდაჭერის ელფოსტა.
5. `Firestore Database > Create database`: აირჩიე **Standard edition**, ნაგულისხმევი `(default)` მონაცემთა ბაზა და `Production mode` (უფასო პროექტში ერთ უფასო ბაზას იყენებ). აირჩიე რეგიონი; შემდეგ `Rules` ფანჯარაში ჩასვი `firestore.rules`-ის მთლიანი ტექსტი → `Publish`.
6. შენი საიტი უკვე **საჯარო რეალური განცხადებებით** იმუშავებს, მაგრამ ფოტოების ატვირთვა ჯერ გამორთული იქნება. ფოტოები ჩაირთვება ნაბიჯებით 3–4. სურათის გარეშე განცხადების დამატება უკვე შესაძლებელია.

## ნაბიჯი 3 — Cloudinary Free (ფოტოების ანგარიში)

1. შექმენი უფასო ანგარიში https://cloudinary.com/ (გაითვალისწინე უფასო ლიმიტები).
2. Dashboard-ში იპოვე **Cloud name**, **API Key**, **API Secret**. **API Secret არ გააზიარო**, არ ჩასვა GitHub-ის ფაილებში ან `config.js`-ში.
3. Cloudinary-ში ცალკე unsigned upload preset **არ არის საჭირო** — Cloudflare Worker ატვირთავს ფოტოებს *signed* მოთხოვნებით.

## ნაბიჯი 4 — Cloudflare Workers Free (დაცული ატვირთვა)

1. შედი https://dash.cloudflare.com/ → `Workers & Pages` → `Create` → `Worker` → `Deploy` (დასახელება, მაგალითად `darcha-photos`). დარჩი Free გეგმაზე.
2. გახსენი Worker → `Edit code` და ჩაანაცვლე კოდი ფაილიდან `cloudflare-worker/worker.js`; შეინახე და Deploy გააკეთე.
3. გახსენი Worker → `Settings` → `Variables and Secrets` და დაამატე შემდეგი მნიშვნელობები:

   | სახელი | მნიშვნელობა | ტიპი |
   |---|---|---|
   | `FIREBASE_PROJECT_ID` | Firebase `projectId` | Text |
   | `FRONTEND_ORIGIN` | `https://USERNAME.github.io` (ბოლოს / არ უნდა) | Text |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud name | Text |
   | `CLOUDINARY_API_KEY` | Cloudinary API Key | **Secret** |
   | `CLOUDINARY_API_SECRET` | Cloudinary API Secret | **Secret** |

4. შეინახე ცვლადები და Worker ხელახლა Deploy გააკეთე. **საიდუმლო ცვლადები GitHub-ზე არ ატვირთო**.
5. Worker-ს ექნება მისამართი მსგავსად `https://darcha-photos.YOURNAME.workers.dev`. GitHub-ში `config.js`-ის `mediaConfig.photoProxyUrl` ველში ჩასვი ეს მისამართი, **ბოლოს `/` გარეშე** და შეინახე Commit.
6. დაუბრუნდი საიტს, შეხვედი Google-ით ან ელფოსტით, დაამატე სატესტო განცხადება **ერთი ფოტოთი**, ნახე საიტი სხვა მოწყობილობიდან, შეამოწმე გამყიდველთან დაკავშირების ღილაკი, სტატუსის შეცვლა და წაშლა.

Cloudflare Worker ამოწმებს Firebase მომხმარებლის ID Token-ს Google-ის საჯარო ხელმოწერის გასაღებებით, ზღუდავს ფაილის ფორმატსა და ზომას (JPG/PNG/WEBP, 5 MiB), და მხოლოდ შემდეგ აგზავნის მას Cloudinary-ში, **საიდუმლო API გასაღებების გამოუქვეყნებლად**. Worker-იდან განცხადების წაშლა ამოწმებს მფლობელს Firestore-ში და შლის ფოტოს Cloudinary-დან.

## შენიშვნები და უსაფრთხოება

- არ გათიშო Firestore Security Rules; **არ გამოიყენო** `allow read, write: if true`.
- საჯაროდ გამოტანილი ტელეფონის ნომერი ჩანს მნახველებისთვის; დაამატე საკონტაქტო პირი, რეალური Privacy Policy და Terms, ასევე შეტყობინების/საჩივრის გზა.
- Firebase Spark-ში Firestore-ის უფასო ზღვარია 50,000 დოკუმენტის წაკითხვა და 20,000 ჩაწერა დღეში; Cloudinary Free — 25 კრედიტი თვეში; Cloudflare Workers Free — 100,000 მოთხოვნა დღეში (პროვაიდერის ცვლილებებს ადევნე თვალი).
- ვინაიდან მომხმარებლები შეიძლება დარეგისტრირდნენ სპამისთვის, **საჯარო მარკეტინგულ გაშვებამდე** საჭიროა დამატებითი rate limiting, მოდერაცია, უკუკავშირი და მფლობელის მიერ ბოროტად გამოყენების კონტროლი. Worker-ის origin-check არ ცვლის მომხმარებლის ავტორიზაციას.
- თუ ფოტოები წარმატებით აიტვირთა Cloudinary-ში, მაგრამ ბოლო Firestore ჩაწერა ჩავარდა, შეიძლება Cloudinary-ში დარჩეს უპატრონო ფოტო; ასეთი შემთხვევები დააკვირდი და საჭიროებისას ხელით წაშალე.
- `FireStore`-ში ლიმიტად იტვირთება 250 ახალი განცხადება; მასშტაბირებისთვის საჭიროა გვერდებად ჩატვირთვა / სერვერული ფილტრაცია.
- ამ ვერსიის Worker-ის კოდი ადგილობრივად შემოწმებულია, მაგრამ **ნამდვილი Firebase/Cloudinary ანგარიშების გარეშე ბოლომდე live upload ვერ დატესტდება**. პირველ გაშვებამდე გააკეთე ზემოთ აღწერილი საცდელი ატვირთვა.
- `config.js`-ში მონაცემების ჩაწერა და თითოეული სერვისის ანგარიშის შექმნა შენ უნდა დაასრულო. ZIP-ის ატვირთვა მარტო **არ** ჩართავს რეალურ მონაცემებს ან ფოტოებს.

## ფაილები

- `index.html`, `styles.css`, `app.js`, `i18n.js`, `assets/` — საჯარო სამენოვანი საიტი.
- `config.js` — Firebase-ის საჯარო Web კონფიგურაცია + Cloudflare Worker URL.
- `firebase-service.js` — რეალური Auth/Firestore + Workers API კავშირი.
- `firestore.rules` — Copy/Paste Firebase Rules-ში.
- `cloudflare-worker/worker.js` — ცალკე Cloudflare Workers პროექტში გასაშვები კოდი.
- `service-worker.js` — მობილური ბრაუზერის ქეში; ვერსიის მატებასთან ერთად ახლდება.
