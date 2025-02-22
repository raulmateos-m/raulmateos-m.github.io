<!DOCTYPE html>
<html lang="en">
<head>
<title>Iron Maiden record collection - Pictures</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="author" content="Raul Mateos">
<meta name="keywords" content="Iron Maiden record collection vinyl pictures">
<meta name="description" content="Iron Maiden record collection: Vinyl Records - Pictures">
<meta name="robots" content="index, follow">
<meta name="revisit-after" content="45 days">
<link rel="stylesheet" href="../../styles/raul.css" type="text/css">
<link rel="stylesheet" href="../../styles/fotorama.css" type="text/css">
<link rel="icon" href="../../images/ironmaiden.ico">
<script src="../../scripts/jquery-3.7.1.min.js"></script>
<script src="../../scripts/fotorama.js"></script>
<style>
* {box-sizing: border-box;}
.row {display: flex; clear: both;}
.column {flex: 50%; padding: 10px;}
.zi {cursor: zoom-in;}
.zo {cursor: zoom-out;}
</style>
<?php
echo "<script>\n";
echo "$(document).ready(function(){\n";
$dir = getcwd();
$pattern = '/\.jpg$/i';
foreach(scandir($dir) as $item){
	if (preg_match($pattern, $item)) {
		$titu = preg_replace('/\.jpg$/','',$item);
		echo("$('.show_$titu').click(function(){
		$('.om_$titu').show();
	});
	$('.hide_$titu').click(function(){
		$('.om_$titu').hide();
	});\n");
}}
echo "});\n";
echo "</script>\n";
echo '<style>';
foreach(scandir($dir) as $item){
	if (preg_match($pattern, $item)) {
 		$titu = preg_replace('/\.jpg$/','',$item);
		echo(".om_$titu {display:none;} ");
}}
echo '</style>';
?>
</head>
<body>
<header id="toc">
<h1>Iron Maiden Record Collection Vinyl</h1>
<nav>
<ul id="nav">
	<li><a href="../../rainbow/vinyl.html">Rainbow</a></li>
	<li id="page2">Iron Maiden</a></li>
	<li><a href="../../deep_purple.html">Deep Purple</a></li>
	<li><a href="../../black_sabbath.html">Black Sabbath</a></li>
	<li><a href="../../dio.html">DIO</a></li>
	<li><a href="../../index.html">Vinyl Collection</a></li>
	<li><a href="../../CD.html">CD Collection</a></li>
</ul>
</nav>
<nav>
<ul id="navb">
	<li><a href="../singles.html">Vinyl - Singles</a></li>
	<li><a href="../LP.html">Vinyl - LP</a></li>
	<li><a href="../CD_singles.html">CD - Singles</a></li>
	<li><a href="../CD.html">CD</a></li>
	<li><a href="../cassette.html">Cassette</a></li>
	<li><a href="../video.html">Video</a></li>
	<li><a href="../bootlegs.html">Bootlegs</a></li>
</ul>
</nav>
</header>
<section class='row'>
<?php
$dir = getcwd();
$pattern = '/\.jpg$/i';
echo '<div class="column">';
foreach(scandir($dir) as $item){
	if (preg_match($pattern, $item)) {
		$titu = preg_replace('/\.jpg$/','',$item);
		echo("<img src=\"$item\" class=\"img-responsive img-thumbnail hide_$titu om_$titu zo\"><a class='show_$titu zi'>$titu</a><br>\n");
}}
echo '</div>';
echo '<div class="fotorama column" data-nav="thumbs">';
foreach(scandir($dir) as $item){
	if (preg_match($pattern, $item)) {
		$tittle = preg_replace('/\.jpg$/','',$item);
		echo("<img src=\"$item\" data-caption=\"$tittle\">\n");
}}
?>
</div>
</section>
<footer>
<div id="up"><a href="#toc">Go Up</a>&nbsp; </div>
</footer>
</body>
</html>
