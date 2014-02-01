<?php
$map_dir = './assets/images/';
$scale = 5;
$x_off = 0;
$y_off = 120;
$screen_width = 320;
$screen_height = 480;
if ($dir_handle = opendir($map_dir)) {
  echo "Files:\n";
  while (false !== ($file = readdir($dir_handle))) {

    if(is_substr('_org', $file) && is_substr('.png', $file)){
      compile_map($map_dir, $file);
    }
  }
  $js = 'var maps = '.json_encode($maps).';'."\n";

  write_to_file('assets/data/maps.js', $js);  

 }

function compile_map($map_dir, $filename){
  echo "Compiling $filename \n";
  $base_name = explode('.', $filename);
  $base_name = $base_name[0];
  $size = getimagesize($map_dir.$filename);
  $width = $size[0];
  $height = $size[1];

  $org = imagecreatefrompng($map_dir.$filename);
  global $scale;
  global $x_off, $y_off, $screen_width, $screen_height;
  $im = imagecreatetruecolor($screen_width, $screen_height);
  $background_color = imagecolorallocate($im, 0, 0, 0);
  $block_color = imagecolorallocate($im, 255, 255, 255);
  $control_panel_height = 120;
  $player_1_control_panel = imagecreatefrompng('assets/images/player_1/control_panel.png');
  $player_2_control_panel = imagecreatefrompng('assets/images/player_2/control_panel.png');
  flipVertical($player_2_control_panel);
  flipHorizontal($player_2_control_panel);
  //  imagecopyresized($im, $player_1_control_panel, 0, $screen_height-$control_panel_height, 0, 0, $screen_width, $control_panel_height, $screen_width, $control_panel_height);
  //imagecopyresized($im, $player_2_control_panel, 0, 0, 0, 0, $screen_width, $control_panel_height, $screen_width, $control_panel_height);
  for($x = 0; $x<$width; $x++){
    for($y = 0; $y<$height; $y++){
      $rgb = imagecolorat($org, $x, $y);
      $colors = imagecolorsforindex($org, $rgb);
      $color = 'black';
      if(($colors['red']==255) && ($colors['green']==255) && ($colors['blue']==255)){
	$color = 'white';
      }
      $new_x = $x*$scale + $x_off;
      $new_y = $y*$scale + $y_off;
      $loc_key = ($new_x).'-'.($new_y);
      if($color == 'white'){
	imagefilledrectangle($im, $new_x, $new_y, $new_x+$scale, $new_y+$scale, $block_color);
	$objects[$loc_key] = array('type'=>'solid', 'x'=>$new_x+$scale/2,'y'=>$new_y+$scale/2);
      }
    }
  }
  $map_name = str_replace('_org', '', $base_name);
  global $maps;
  $maps[$map_name]['walls'] = $objects;
  $maps[$map_name]['object_types'] = array('wall'=>array('width'=>$scale));
  $maps[$map_name]['top'] = $y_off;
  $maps[$map_name]['bottom'] = $screen_height-$y_off;
  

  imagepng($im, $map_dir.str_replace('_org', '_without_controls', $base_name).'.png');
}


//utils
//utils
function flipVertical(&$img) {
  $size_x = imagesx($img);
  $size_y = imagesy($img);
  $temp = imagecreatetruecolor($size_x, $size_y);
  $x = imagecopyresampled($temp, $img, 0, 0, 0, ($size_y-1), $size_x, $size_y, $size_x, 0-$size_y);
  if ($x) {
    $img = $temp;
  }
  else {
    die("Unable to flip image");
  }
}


function flipHorizontal(&$img) {
  $size_x = imagesx($img);
  $size_y = imagesy($img);
  $temp = imagecreatetruecolor($size_x, $size_y);
  $x = imagecopyresampled($temp, $img, 0, 0, ($size_x-1), 0, $size_x, $size_y, 0-$size_x, $size_y);
  if ($x) {
    $img = $temp;
  }
  else {
    die("Unable to flip image");
  }
}

function pr($var){
  print_r($var);
  echo "\n";
}

function is_substr($needle, $haystack){ 
  $pos = strpos($haystack, $needle); 
  
  if ($pos === false) { 
    return false; 
  } else { 
    return true; 
  } 
} 

function write_to_file($filename, $somecontent, $flag='w+'){
  touch($filename);
  // Let's make sure the file exists and is writable first.
  if (is_writable($filename)) {

    // In our example we're opening $filename in append mode.
    // The file pointer is at the bottom of the file hence
    // that's where $somecontent will go when we fwrite() it.
    if (!$handle = fopen($filename, $flag)) {
      echo "Cannot open file ($filename)";
      exit;
    }

    // Write $somecontent to our opened file.
    if (fwrite($handle, $somecontent) === FALSE) {
      echo "Cannot write to file ($filename)";
      exit;
    }

    fclose($handle);

  } else {
    echo "The file $filename is not writable";
  }
}