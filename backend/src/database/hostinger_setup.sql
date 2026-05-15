-- ============================================================
-- SYLESS DATABASE SETUP — Hostinger MySQL
-- ============================================================
-- HOW TO USE:
--   1. Log in to Hostinger → Hosting → Manage → Databases
--   2. Create a new database (e.g. u123456789_syless)
--   3. Open phpMyAdmin from Hostinger panel
--   4. Select your database → click "SQL" tab
--   5. Paste this entire file and click "Go"
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`                      INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`                VARCHAR(30)      NOT NULL,
  `email`                   VARCHAR(255)     NOT NULL,
  `password`                VARCHAR(255)     NOT NULL,
  `role`                    ENUM('user','pro','enterprise','admin') DEFAULT 'user',
  `avatar`                  TEXT             DEFAULT '',
  `bio`                     VARCHAR(300)     DEFAULT '',
  `stats_problems_solved`   INT(10) UNSIGNED DEFAULT 0,
  `stats_total_runs`        INT(10) UNSIGNED DEFAULT 0,
  `stats_streak`            INT(10) UNSIGNED DEFAULT 0,
  `stats_xp`                INT(10) UNSIGNED DEFAULT 0,
  `stats_level`             INT(10) UNSIGNED DEFAULT 1,
  `subscription_plan`       ENUM('free','pro','enterprise') DEFAULT 'free',
  `subscription_expires_at` DATETIME         DEFAULT NULL,
  `preferences`             JSON             DEFAULT NULL,
  `last_login`              DATETIME         DEFAULT NULL,
  `is_active`               TINYINT(1)       DEFAULT 1,
  `email_verified`          TINYINT(1)       DEFAULT 0,
  `reset_password_token`    VARCHAR(255)     DEFAULT NULL,
  `reset_password_expires`  DATETIME         DEFAULT NULL,
  `created_at`              DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username` (`username`),
  UNIQUE KEY `users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_xp` (`stats_xp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── PROBLEMS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `problems` (
  `id`                   INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`                VARCHAR(255)     NOT NULL,
  `slug`                 VARCHAR(255)     NOT NULL,
  `description`          TEXT             NOT NULL,
  `difficulty`           ENUM('beginner','easy','medium','hard','expert') DEFAULT 'easy',
  `category`             ENUM('arrays','strings','stack','queue','linkedlist','tree','graph','sorting','searching','recursion','dp','math','basics') NOT NULL,
  `tags`                 JSON             DEFAULT NULL,
  `starter_code`         JSON             DEFAULT NULL,
  `solution`             JSON             DEFAULT NULL,
  `test_cases`           JSON             DEFAULT NULL,
  `hints`                JSON             DEFAULT NULL,
  `explanation`          TEXT             DEFAULT NULL,
  `dsa_visualization`    JSON             DEFAULT NULL,
  `total_submissions`    INT(10) UNSIGNED DEFAULT 0,
  `accepted_submissions` INT(10) UNSIGNED DEFAULT 0,
  `acceptance_rate`      FLOAT            DEFAULT 0,
  `is_premium`           TINYINT(1)       DEFAULT 0,
  `order_num`            INT(11)          DEFAULT 0,
  `is_active`            TINYINT(1)       DEFAULT 1,
  `created_by`           INT(10) UNSIGNED DEFAULT NULL,
  `created_at`           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `problems_slug` (`slug`),
  KEY `idx_problems_category` (`category`),
  KEY `idx_problems_difficulty` (`difficulty`),
  KEY `idx_problems_active` (`is_active`),
  KEY `idx_problems_order` (`order_num`),
  CONSTRAINT `fk_problems_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── SNIPPETS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `snippets` (
  `id`         INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT(10) UNSIGNED NOT NULL,
  `title`      VARCHAR(255)     NOT NULL,
  `code`       LONGTEXT         NOT NULL,
  `language`   VARCHAR(50)      DEFAULT 'syless',
  `created_at` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_snippets_user` (`user_id`),
  CONSTRAINT `fk_snippets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── SUBMISSIONS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `submissions` (
  `id`             INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        INT(10) UNSIGNED NOT NULL,
  `problem_id`     INT(10) UNSIGNED NOT NULL,
  `code`           LONGTEXT         NOT NULL,
  `verdict`        VARCHAR(50)      DEFAULT NULL,
  `passed`         INT(10) UNSIGNED DEFAULT 0,
  `total`          INT(10) UNSIGNED DEFAULT 0,
  `execution_time` INT(10) UNSIGNED DEFAULT 0,
  `python_code`    LONGTEXT         DEFAULT NULL,
  `created_at`     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_submissions_user` (`user_id`),
  KEY `idx_submissions_problem` (`problem_id`),
  KEY `idx_submissions_verdict` (`verdict`),
  CONSTRAINT `fk_submissions_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── SEED: 20 DSA Problems ─────────────────────────────────────────────────────
INSERT IGNORE INTO `problems`
  (`title`, `slug`, `description`, `difficulty`, `category`, `tags`, `starter_code`, `solution`, `test_cases`, `hints`, `order_num`)
VALUES

('Hello SYLESS', 'hello-syless',
 'Print the text "Hello, World!" using the SYLESS output command.\n\nUse the ''say ->'' command to print text.\n\n**Hint:** say -> "Hello, World!"',
 'beginner', 'basics',
 '["output","basics"]',
 '{"syless":"# Print Hello, World!\\n"}',
 '{"syless":"say -> \\"Hello, World!\\"","python":"print(\\"Hello, World!\\")"}',
 '[{"input":"","expectedOutput":"Hello, World!","isHidden":false}]',
 '["Use: say -> \\"Hello, World!\\""]',
 1),

('Sum of Two Numbers', 'sum-two-numbers',
 'Create two variables x = 15 and y = 27, then print their sum.\n\nExpected output: **42**',
 'beginner', 'basics',
 '["variables","math"]',
 '{"syless":"make x = 15\\nmake y = 27\\n# Print the sum\\n"}',
 '{"syless":"make x = 15\\nmake y = 27\\nsay -> x + y"}',
 '[{"input":"","expectedOutput":"42","isHidden":false}]',
 '["Use make to create variables","Use + to add them","Use say -> to print"]',
 2),

('Even or Odd', 'even-or-odd',
 'Create a variable n = 7. Check if n is even or odd and print "Even" or "Odd".\n\nExpected output: **Odd**',
 'beginner', 'basics',
 '["conditions","modulo"]',
 '{"syless":"make n = 7\\n# Check even or odd\\n"}',
 '{"syless":"make n = 7\\ncheck n % 2 == 0 {\\n    say -> \\"Even\\"\\n}\\notherwise {\\n    say -> \\"Odd\\"\\n}"}',
 '[{"input":"","expectedOutput":"Odd","isHidden":false}]',
 '["Use % (modulo) to check remainder","n % 2 == 0 means even"]',
 3),

('Countdown', 'countdown',
 'Use a while loop to count down from 5 to 1 and print each number.',
 'easy', 'basics',
 '["loops","while"]',
 '{"syless":"make n = 5\\n# Count down using repeat while\\n"}',
 '{"syless":"make n = 5\\nrepeat while n > 0 {\\n    say -> n\\n    n = n - 1\\n}"}',
 '[{"input":"","expectedOutput":"5\\n4\\n3\\n2\\n1","isHidden":false}]',
 '["Use repeat while n > 0","Decrease n by 1 each iteration"]',
 4),

('Sum of Array', 'sum-of-array',
 'Create nums = [10, 20, 30, 40] and print the sum.\n\nExpected output: **100**',
 'easy', 'arrays',
 '["arrays","loops"]',
 '{"syless":"make nums = [10, 20, 30, 40]\\nmake total = 0\\n# Sum all elements\\n"}',
 '{"syless":"make nums = [10, 20, 30, 40]\\nmake total = 0\\nfor each n in nums {\\n    total = total + n\\n}\\nsay -> total"}',
 '[{"input":"","expectedOutput":"100","isHidden":false}]',
 '["Use for each to loop","Add each element to total"]',
 5),

('Find Maximum', 'find-maximum',
 'Given nums = [3, 17, 5, 42, 9, 1], find and print the maximum value.\n\nExpected output: **42**',
 'easy', 'arrays',
 '["arrays","searching"]',
 '{"syless":"make nums = [3, 17, 5, 42, 9, 1]\\nmake maxi = 0\\n# Find max\\n"}',
 '{"syless":"make nums = [3, 17, 5, 42, 9, 1]\\nmake maxi = 0\\nfor each n in nums {\\n    check n > maxi {\\n        maxi = n\\n    }\\n}\\nsay -> maxi"}',
 '[{"input":"","expectedOutput":"42","isHidden":false}]',
 '["Track max in a variable","Update when you find a bigger number"]',
 6),

('Sort Ascending', 'sort-ascending',
 'Sort nums = [64, 25, 12, 22, 11] in ascending order and print.\n\nExpected: **[11, 12, 22, 25, 64]**',
 'easy', 'sorting',
 '["sorting","arrays"]',
 '{"syless":"make nums = [64, 25, 12, 22, 11]\\n# Sort and print\\n"}',
 '{"syless":"make nums = [64, 25, 12, 22, 11]\\nsort nums ascending\\nsay -> nums"}',
 '[{"input":"","expectedOutput":"[11, 12, 22, 25, 64]","isHidden":false}]',
 '["Use: sort nums ascending","Then print with say ->"]',
 7),

('Binary Search', 'binary-search',
 'Search for value 15 in sorted array [2, 5, 10, 15, 20, 25, 30].\n\nExpected output: **3** (index)',
 'medium', 'searching',
 '["searching","binary search"]',
 '{"syless":"make nums = [2, 5, 10, 15, 20, 25, 30]\\n# Binary search for 15\\n"}',
 '{"syless":"make nums = [2, 5, 10, 15, 20, 25, 30]\\nbinary search 15 in nums"}',
 '[{"input":"","expectedOutput":"3","isHidden":false}]',
 '["Array must be sorted","Use: binary search VALUE in ARRAY"]',
 8),

('Stack Push and Pop', 'stack-push-pop',
 'Create a stack. Push 10, 20, 30. Pop once. Print the final stack.\n\nExpected: **[10, 20]**',
 'easy', 'stack',
 '["stack","dsa"]',
 '{"syless":"make stack\\n# Push 10, 20, 30 then pop\\n"}',
 '{"syless":"make stack\\npush 10 into stack\\npush 20 into stack\\npush 30 into stack\\npop from stack\\nsay -> stack"}',
 '[{"input":"","expectedOutput":"[10, 20]","isHidden":false}]',
 '["push X into stack","pop from stack removes top","say -> stack to print"]',
 9),

('Queue Operations', 'queue-operations',
 'Create a queue. Insert 100, 200, 300. Remove one from front. Print queue.\n\nExpected: **deque([200, 300])**',
 'easy', 'queue',
 '["queue","dsa"]',
 '{"syless":"make queue\\n# Insert and remove\\n"}',
 '{"syless":"make queue\\ninsert 100 into queue\\ninsert 200 into queue\\ninsert 300 into queue\\nremove from queue\\nsay -> queue"}',
 '[{"input":"","expectedOutput":"deque([200, 300])","isHidden":false}]',
 '["insert X into queue adds to back","remove from queue removes from front"]',
 10),

('Greet Function', 'greet-function',
 'Create a task greet(name) that prints "Hello, NAME!" then call it with "SYLESS".\n\nExpected: **Hello, SYLESS!**',
 'easy', 'basics',
 '["functions","basics"]',
 '{"syless":"# Create a greet function\\n"}',
 '{"syless":"task greet(name) {\\n    say -> \\"Hello, \\" + name + \\"!\\"\\n}\\ngreet(\\"SYLESS\\")"}',
 '[{"input":"","expectedOutput":"Hello, SYLESS!","isHidden":false}]',
 '["task name(param) { }","Use + to join strings"]',
 11),

('Area of Rectangle', 'area-rectangle',
 'Create task area(length, width) that returns their product.\nCall area(8, 5) and print result.\n\nExpected: **40**',
 'easy', 'basics',
 '["functions","math"]',
 '{"syless":"task area(length, width) {\\n    # Return the area\\n}\\nsay -> area(8, 5)\\n"}',
 '{"syless":"task area(length, width) {\\n    give length * width\\n}\\nsay -> area(8, 5)"}',
 '[{"input":"","expectedOutput":"40","isHidden":false}]',
 '["Use give to return a value"]',
 12),

('Factorial', 'factorial',
 'Write recursive factorial(n). Call factorial(6).\n\nExpected: **720**',
 'medium', 'recursion',
 '["recursion","math"]',
 '{"syless":"task factorial(n) {\\n    # Base case and recursion\\n}\\nsay -> factorial(6)\\n"}',
 '{"syless":"task factorial(n) {\\n    check n == 0 {\\n        give 1\\n    }\\n    give n * factorial(n - 1)\\n}\\nsay -> factorial(6)"}',
 '[{"input":"","expectedOutput":"720","isHidden":false}]',
 '["Base case: n==0 gives 1","Recursive: n * factorial(n-1)"]',
 13),

('Fibonacci', 'fibonacci',
 'Write recursive fib(n). Call fib(8).\n\nExpected: **21**',
 'medium', 'recursion',
 '["recursion","fibonacci"]',
 '{"syless":"task fib(n) {\\n    # Fibonacci recursion\\n}\\nsay -> fib(8)\\n"}',
 '{"syless":"task fib(n) {\\n    check n == 0 { give 0 }\\n    check n == 1 { give 1 }\\n    give fib(n - 1) + fib(n - 2)\\n}\\nsay -> fib(8)"}',
 '[{"input":"","expectedOutput":"21","isHidden":false}]',
 '["Two base cases: n==0 and n==1"]',
 14),

('FizzBuzz', 'fizzbuzz',
 'Loop 1-15. Print FizzBuzz/Fizz/Buzz/number based on divisibility.',
 'easy', 'basics',
 '["loops","conditions","classic"]',
 '{"syless":"make i = 1\\nrepeat while i <= 15 {\\n    # FizzBuzz logic\\n    i = i + 1\\n}\\n"}',
 '{"syless":"make i = 1\\nrepeat while i <= 15 {\\n    check i % 15 == 0 { say -> \\"FizzBuzz\\" }\\n    check i % 3 == 0 { say -> \\"Fizz\\" }\\n    check i % 5 == 0 { say -> \\"Buzz\\" }\\n    otherwise { say -> i }\\n    i = i + 1\\n}"}',
 '[{"input":"","expectedOutput":"1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz\\n11\\nFizz\\n13\\n14\\nFizzBuzz","isHidden":false}]',
 '["Check divisible by 15 FIRST","Use i % 3 == 0 for Fizz"]',
 15),

('Power Function', 'power-function',
 'Write recursive power(base, exp). Call power(2, 10).\n\nExpected: **1024**',
 'hard', 'recursion',
 '["recursion","math","challenge"]',
 '{"syless":"task power(base, exp) {\\n    # Recursive power\\n}\\nsay -> power(2, 10)\\n"}',
 '{"syless":"task power(base, exp) {\\n    check exp == 0 { give 1 }\\n    give base * power(base, exp - 1)\\n}\\nsay -> power(2, 10)"}',
 '[{"input":"","expectedOutput":"1024","isHidden":false}]',
 '["Base case: exp == 0 gives 1","Recursive: base * power(base, exp-1)"]',
 16);

SET foreign_key_checks = 1;

-- ============================================================
-- DONE! All tables and 16 sample problems created.
-- Next step: Update backend/.env with your DB credentials.
-- ============================================================
