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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
