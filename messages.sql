-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: sql.freedb.tech
-- Generation Time: Oct 18, 2023 at 06:36 PM
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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
