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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `post_id` (`post_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
