<?php

# This is the part that you should edit to customize your build
$settings = array(
	//"DEMAND_CLASS_PATH" => dirname(__FILE__), # /path/to/the/demand/dir
	"SOURCE_MANAGER" => "github", # github | local

	// GitHub options
	"GITHUB_USERNAME" => "",
	"GITHUB_PASSWORD" => "",
	"GITHUB_REPOSITORY" => "",

	// Local options
	"LOCAL_REPOSITORY" => "", # /path/to/your/local/demand/repo

	// Output options
	"RESULT_FILE" => "", # /path/to/the/output/js/file
	"CDN_URL" => "" # /url/to/final/demand/js/file
);
# The editing part ends here

$demandPath = $settings["DEMAND_CLASS_PATH"] ? $settings["DEMAND_CLASS_PATH"] : dirname(__FILE__);
$settings["RESULT_FILE"] = $settings["RESULT_FILE"] ? $settings["RESULT_FILE"] : (dirname(__FILE__) . "/demand.min.js");
if (!$settings["CDN_URL"])
{
	$settings["CDN_URL"] = str_replace("\\", "/", "http://" . $_SERVER["HTTP_HOST"] . dirname($_SERVER["REQUEST_URI"]));
}
$demandFile = $demandPath . "/demand.php";

if (!is_file($demandFile))
{
	die("Error: The demand.php class file can't be found at: " . $demandFile);
}

require_once($demandFile);

if (!class_exists("DemandServer"))
{
	die("Error: Couldn't find the &quot;DemandServer&quot; class");
}

$method = strtolower($_SERVER["REQUEST_METHOD"]);

$demand = new DemandServer($settings);
switch ($method)
{
	case "post":
		switch ($_REQUEST["action"])
		{
			case "localize":
				$demand -> make();
				break;
			default:
				$demand -> flag();
				break;
		}
		break;
	default:
		$demand -> show();
		break;
}

?>