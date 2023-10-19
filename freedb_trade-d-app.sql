-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: sql.freedb.tech
-- Generation Time: Oct 18, 2023 at 06:32 PM
-- Server version: 8.0.34-0ubuntu0.22.04.1
-- PHP Version: 8.2.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `freedb_trade-d-app`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`freedb_trade-admin`@`%` PROCEDURE `AllPostToCard` ()   BEGIN
	SELECT posts.*, images.image_path,p.name,p.lastname,p.avatar
	FROM posts
	LEFT JOIN images ON posts.post_id = images.post_id
	RIGHT JOIN profile p ON posts.uid = p.uid
	GROUP BY posts.post_id ORDER BY posts.post_id DESC;
END$$

CREATE DEFINER=`freedb_trade-admin`@`%` PROCEDURE `Auth` (IN `p_username` VARCHAR(50), IN `p_password` VARCHAR(100), IN `p_new_ip` VARCHAR(50))   BEGIN
    -- Declare variables to store user data
    DECLARE v_uid INT;
    DECLARE v_username VARCHAR(50);
    DECLARE v_last_login DATETIME;
    
    -- Check if the username and password match
    SELECT uid, username, last_login INTO v_uid, v_username, v_last_login
    FROM login 
    WHERE username = p_username AND `password` = p_password;
    
    IF v_uid IS NOT NULL THEN
        -- Update the last_ip for the matching user
        UPDATE login l
        SET l.last_ip = p_new_ip, last_login = NOW()
        WHERE uid = v_uid;
        
        -- Return user data from both "login" and "profile" tables
        SELECT l.*, p.*
        FROM login l
        JOIN profile p ON l.uid = p.uid
        WHERE l.uid = v_uid;
    ELSE
        SELECT 'Invalid username or password.' AS result;
    END IF;
END$$

CREATE DEFINER=`freedb_trade-admin`@`%` PROCEDURE `DeletePost` (IN `p_postId` INT)   BEGIN
	DELETE FROM images WHERE post_id = p_postId;
	DELETE FROM posts WHERE post_id = p_postId;
END$$

CREATE DEFINER=`freedb_trade-admin`@`%` PROCEDURE `GetChat` (IN `u_uid` INT)   SELECT
    p.chat_id,
    c.chat_name,
    m.sender_uid AS last_message_sender_uid,
    m.message_text AS last_message_text,
    m.send_at AS last_message_sent_at
FROM participants p
JOIN chatrooms c ON p.chat_id = c.chat_id
LEFT JOIN (
    SELECT
        chat_id,
        sender_uid,
        message_text,
        MAX(send_at) AS max_send_at
    FROM messages
    GROUP BY chat_id
) AS m_subquery ON c.chat_id = m_subquery.chat_id
LEFT JOIN messages m ON m_subquery.chat_id = m.chat_id AND m_subquery.max_send_at = m.send_at
WHERE p.participant_uid = u_uid
ORDER BY last_message_sent_at DESC$$

CREATE DEFINER=`freedb_trade-admin`@`%` PROCEDURE `GetMessages` (IN `chat_id` INT)   BEGIN
    SELECT m.* FROM messages m WHERE m.chat_id = chat_id;
END$$

CREATE DEFINER=`freedb_trade-admin`@`%` PROCEDURE `PostDetail` (IN `p_post_id` INT)   BEGIN
	SELECT
	  p.post_id,
	  p.content AS post_content,
	  JSON_ARRAYAGG(
	    JSON_OBJECT('image_id', i.image_id, 'image_path', i.image_path)
		  ) AS images
	FROM posts p
	LEFT JOIN images i ON p.post_id = i.post_id
	WHERE p.post_id = p_post_id
	GROUP BY p.post_id, p.content;
END$$

CREATE DEFINER=`freedb_trade-admin`@`%` PROCEDURE `PostToCard` (IN `u_uid` INT)   BEGIN
	SELECT posts.*, images.image_path,p.name,p.lastname,p.avatar
	FROM posts
	LEFT JOIN images ON posts.post_id = images.post_id
	RIGHT JOIN profile p ON posts.uid = p.uid
	WHERE posts.uid = u_uid GROUP BY posts.post_id ORDER BY posts.post_id DESC;
END$$

CREATE DEFINER=`freedb_trade-admin`@`%` PROCEDURE `Register` (IN `u_username` VARCHAR(50), IN `u_password` VARCHAR(100), IN `u_name` VARCHAR(50), IN `u_lastname` VARCHAR(50), IN `u_birth` DATE, IN `u_gender` VARCHAR(6), IN `u_email` VARCHAR(50), IN `u_tel` VARCHAR(10))   BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- An error occurred, roll back the transaction
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Registration failed.';
    END;

    -- Start a transaction
    START TRANSACTION;

    -- Insert into the 'login' table
    INSERT INTO login (username, `password`, create_at)
    VALUES (u_username, u_password, NOW());

    -- Check if the insert into 'login' was successful
    IF ROW_COUNT() = 1 THEN
        -- Insert into the 'profile' table
        INSERT INTO profile (`name`, lastname, birth_date, gender, email, tel)
        VALUES (u_name, u_lastname, u_birth, u_gender, u_email, u_tel);

        -- Check if the insert into 'profile' was successful
        IF ROW_COUNT() = 1 THEN
            -- Both inserts were successful, commit the transaction
            COMMIT;
        ELSE
            -- Insert into 'profile' failed, roll back the transaction
            ROLLBACK;
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Profile insertion failed.';
        END IF;
    ELSE
        -- Insert into 'login' failed, roll back the transaction
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Login insertion failed.';
    END IF;
END$$

CREATE DEFINER=`freedb_trade-admin`@`%` PROCEDURE `TakeOffer` (IN `uid` INT, IN `offer_uid` INT)   BEGIN
    DECLARE lastest_chat_id INT;

    -- Check if a chatroom with the same participants already exists
    SELECT chat_id INTO lastest_chat_id
    FROM participants
    WHERE participant_uid = uid;

    IF lastest_chat_id IS NULL THEN
        -- If no chatroom exists, create a new chatroom
        INSERT INTO chatrooms (create_at) VALUES (NOW());

        -- Retrieve the last inserted chat_id
        SET lastest_chat_id = LAST_INSERT_ID();

        -- Insert participants into the new chatroom
        INSERT INTO participants (chat_id, participant_uid) VALUES (lastest_chat_id, uid);
        INSERT INTO participants (chat_id, participant_uid) VALUES (lastest_chat_id, offer_uid);
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `chatrooms`
--

CREATE TABLE `chatrooms` (
  `chat_id` int NOT NULL,
  `chat_name` varchar(50) DEFAULT NULL,
  `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `chatrooms`
--

INSERT INTO `chatrooms` (`chat_id`, `chat_name`, `create_at`) VALUES
(1, 'Room1', '2023-10-02 14:34:16'),
(2, 'Room2', '2023-10-03 20:58:34');

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `image_id` int NOT NULL,
  `post_id` int NOT NULL,
  `image_path` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`image_id`, `post_id`, `image_path`) VALUES
(12, 10, 'http:\\192.168.1.108\\uploads\\1696921278911.jpg'),
(13, 11, 'http:\\192.168.1.108\\uploads\\1696931682109.jpg'),
(14, 12, 'http:\\192.168.1.108\\uploads\\1696931865700.jpg'),
(15, 13, 'http:\\192.168.1.108\\uploads\\1697002103551.jpg'),
(16, 13, 'http:\\192.168.1.108\\uploads\\1697002103603.jpg'),
(17, 13, 'http:\\192.168.1.108\\uploads\\1697002103631.jpg'),
(18, 22, '42cc03a3d11419be333813e4cbe8ce61884d9ac923851d9b0a94de7b6015578a'),
(19, 23, 'eb6a12c7a6528bcfc2cf62f52a112af39e888e1bdeda190b3c03dfcbf3182815'),
(20, 23, 'c80dd351b0c7d6f41c088d8563bd7fce604996696a640b2d491eb0c4ec6654b8'),
(21, 23, '6026c63a0871b47bca3a632c0ef55508f4e43cdafd7cd8f1829948f31d76598c'),
(25, 27, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(26, 28, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(27, 25, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(28, 26, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(29, 14, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(30, 15, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(31, 16, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(32, 17, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(33, 18, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(34, 19, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(35, 20, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(36, 21, 'c886969922ea67400f5195081aae8d245a938799e743dd24f1cfd052ffbb1d01'),
(37, 29, 'aa79cdb096d8390bfc4ce8c697cee29a3db54c3768d38841f90b1ea2721ac7f0'),
(38, 29, '91f2697195c14e95e37d0a5daf966f4f96ad9a09e5a2bef32adbe87ecdeb95d5'),
(39, 30, 'a50356e05f31235c47cd8e09a129fea69cfc30bc7ccc657a57c591527f1be73d'),
(40, 30, 'https://trade-d-bucket.s3.ap-southeast-1.amazonaws.com/a6adc4c16b10f2f5c1a5c329f85412940778ff2b9ea34c319ccb9f3b82858d60');

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `uid` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_at` date NOT NULL,
  `last_ip` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `login`
--

INSERT INTO `login` (`uid`, `username`, `password`, `last_login`, `create_at`, `last_ip`) VALUES
(1, 'test1', '123456', '2023-10-18 13:27:33', '2023-10-03', '::1'),
(2, 'test2', '123456', '2023-10-18 15:24:11', '2023-10-03', '::1');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int NOT NULL,
  `chat_id` int NOT NULL,
  `sender_uid` int NOT NULL,
  `message_text` text NOT NULL,
  `send_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`message_id`, `chat_id`, `sender_uid`, `message_text`, `send_at`) VALUES
(1, 1, 1, 'Hello from1', '2023-10-02 13:03:27'),
(2, 1, 2, 'Hello from 2', '2023-10-02 13:03:43'),
(3, 1, 1, 'Hello, this is a test message!', '2023-10-02 16:12:02'),
(4, 1, 2, 'Hello, this is a test message! 2', '2023-10-02 16:24:50'),
(5, 1, 2, 'Sub Dude', '2023-10-02 16:34:54'),
(6, 1, 1, 'Yi\nYo', '2023-10-02 16:35:11'),
(7, 1, 1, 'Yo', '2023-10-02 16:35:22'),
(8, 1, 2, 'Hi Bro', '2023-10-03 22:50:08'),
(9, 1, 1, 'Wow', '2023-10-03 22:50:19'),
(10, 1, 2, 'test', '2023-10-03 22:56:51'),
(11, 1, 1, 'ภาษาไทย', '2023-10-03 22:57:56'),
(12, 1, 2, '<ScrollView\n  ref={scrollViewRef}\n  style={{ flex: 1 }} // Add this style\n  c', '2023-10-03 22:59:30'),
(13, 1, 2, '<ScrollView\n  ref={scrollViewRef}\n  style={{ flex: 1 }} // Add this style\n  contentContainerStyle={{ justifyContent: \'flex-end\' }} // Apply justifyContent here\n  onContentSizeChange={scrollToBottom}\n>\n', '2023-10-03 22:59:42'),
(14, 1, 0, 'msg.message_text', '2023-10-18 13:19:45'),
(15, 1, 1, 'postman_messge3', '2023-10-18 13:20:26'),
(16, 1, 1, 'New test', '2023-10-18 14:16:46'),
(17, 1, 1, 'New test', '2023-10-18 14:17:17'),
(18, 1, 1, 'Try again ', '2023-10-18 14:19:11');

-- --------------------------------------------------------

--
-- Table structure for table `participants`
--

CREATE TABLE `participants` (
  `participants_id` int NOT NULL,
  `chat_id` int NOT NULL,
  `participant_uid` int NOT NULL,
  `participants_type` enum('private','group') NOT NULL DEFAULT 'private'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `participants`
--

INSERT INTO `participants` (`participants_id`, `chat_id`, `participant_uid`, `participants_type`) VALUES
(1, 1, 1, 'private'),
(2, 1, 2, 'private');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `post_id` int NOT NULL,
  `uid` int NOT NULL,
  `content` text NOT NULL,
  `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`post_id`, `uid`, `content`, `create_at`) VALUES
(10, 1, 'Test DB save', '2023-10-10 14:01:18'),
(11, 1, 'Test again ', '2023-10-10 16:54:42'),
(12, 1, 'Test mount ', '2023-10-10 16:57:45'),
(13, 2, 'Post from user2', '2023-10-11 12:28:23'),
(14, 1, 'Post Man Create Post', '2023-10-13 10:27:14'),
(15, 1, 'Post Man Create Post', '2023-10-13 10:30:51'),
(16, 1, 'aws', '2023-10-15 06:17:38'),
(17, 1, 'aws', '2023-10-15 06:23:05'),
(18, 1, 'aws', '2023-10-15 06:23:50'),
(19, 1, 'aws', '2023-10-15 06:24:54'),
(20, 1, 'aws', '2023-10-15 06:26:07'),
(21, 1, 'aws', '2023-10-15 06:29:07'),
(22, 1, 'aws', '2023-10-15 06:29:51'),
(23, 1, 'aws multi', '2023-10-15 06:32:55'),
(25, 1, 'Test to vercel', '2023-10-15 06:48:27'),
(26, 1, 'Test to vercel', '2023-10-15 06:50:01'),
(27, 1, 'Test to vercel', '2023-10-15 06:51:13'),
(28, 1, 'Post From Web', '2023-10-15 06:56:49'),
(29, 2, 'Test upload', '2023-10-18 15:24:43'),
(30, 2, 'Test2', '2023-10-18 15:25:36');

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE `profile` (
  `uid` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `tel` varchar(10) DEFAULT NULL,
  `bio` text,
  `avatar` text,
  `wallpaper` text,
  `is_active` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `profile`
--

INSERT INTO `profile` (`uid`, `name`, `lastname`, `birth_date`, `gender`, `email`, `tel`, `bio`, `avatar`, `wallpaper`, `is_active`) VALUES
(1, 'John', 'Doe', '1990-05-15', 'Male', 'john.doe@email.com', '1234567890', 'Hello From user 1', 'http:\\192.168.1.108\\uploads\\1696921278911.jpg', 'http:\\192.168.1.108\\uploads\\1696921278911.jpg', 'ACTIVE'),
(2, 'Toyy', 'Doe', '1990-05-15', 'Male', 'toy@email.com', '1234567809', 'Hello From user 2', 'http:\\192.168.1.108\\uploads\\1697002103551.jpg', 'http:\\192.168.1.108\\uploads\\1697002103551.jpg', 'ACTIVE');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chatrooms`
--
ALTER TABLE `chatrooms`
  ADD PRIMARY KEY (`chat_id`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`);

--
-- Indexes for table `participants`
--
ALTER TABLE `participants`
  ADD PRIMARY KEY (`participants_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`);

--
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`uid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chatrooms`
--
ALTER TABLE `chatrooms`
  MODIFY `chat_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `login`
--
ALTER TABLE `login`
  MODIFY `uid` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `participants`
--
ALTER TABLE `participants`
  MODIFY `participants_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `profile`
--
ALTER TABLE `profile`
  MODIFY `uid` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
