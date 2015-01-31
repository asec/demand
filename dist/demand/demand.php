<?php
class DemandServer
{

	protected $options = array(
		"DEMAND_CLASS_PATH" => null,
		"SOURCE_MANAGER" => null,
		"GITHUB_USERNAME" => null,
		"GITHUB_PASSWORD" => null,
		"RESULT_FILE" => null,
		"GITHUB_REPOSITORY" => null,
		"LOCAL_REPOSITORY" => null,
		"CDN_URL" => null
	);
	protected $flags = null;
	protected $sourceManager = null;

	public function __construct($options)
	{
		foreach ($options as $key => $value)
		{
			$this -> setOption($key, $value);
		}
		$sm = $options["SOURCE_MANAGER"] ? strtolower($options["SOURCE_MANAGER"]) : "github";
		$smClass = ucfirst($sm) . "Manager";
		$smFile = dirname(__FILE__) . "/source-managers/" . $sm . "/" . $smClass . ".php";
		require_once($smFile);
		if (!class_exists($smClass))
		{
			$this -> renderError(new Exception("The source manager class doesn't exists: " . $smClass . " (" . $smFile . ")"));
		}

		$this -> sourceManager = new $smClass($this -> options);
	}

	public function setOption($key, $value)
	{
		if (!array_key_exists($key, $this -> options))
		{
			return false;
		}

		$this -> options[$key] = $value;
	}

	public function getOption($key, $default = null)
	{
		return $this -> options[$key] ? $this -> options[$key] : $default;
	}

	public function make()
	{
		$this -> sourceManager -> init();
		if ($this -> sourceManager -> hasError())
		{
			$this -> renderError(new Exception($this -> sourceManager -> getError()));
		}

		$content = "";
		$content .= $this -> sourceManager -> grabBaseFile();
		if ($this -> sourceManager -> hasError())
		{
			$this -> renderError(new Exception($this -> sourceManager -> getError()));
		}
		$packages = $_POST["packages"] ? $_POST["packages"] : array();
		$cdnUrl = $this -> getOption("CDN_URL");
		if (substr($cdnUrl, -1) !== "/")
		{
			$cdnUrl .= "/";
		}
		if ($cdnUrl !== true)
		{
			$cdnUrl = explode("/", $cdnUrl);
			if ($cdnUrl[count($cdnUrl) - 2] === "demand-packages")
			{
				array_pop($cdnUrl);
				array_pop($cdnUrl);
				array_push($cdnUrl, "");
			}
			$cdnUrl = implode("/", $cdnUrl) . "demand-packages/";
			$pattern = "/\.settings\.set\(\\\"cdnUrl\\\"\,\s*[\\\"']*(.*?)[\\\"']*\)/";
			$content = preg_replace($pattern, '.settings.set("cdnUrl","' . $cdnUrl . '")', $content);
			$pattern = "/\.settings\.set\(\\\"listenerUrl\\\"\,\s*[\\\"']*(.*?)[\\\"']*\)/";
			$content = preg_replace($pattern, '.settings.set("listenerUrl","")', $content);
		}
		foreach ($packages as $pkg)
		{
			$pkg = $this -> parsePackage($pkg);
			$content .= $this -> sourceManager -> grabPackage($pkg);
			if ($this -> sourceManager -> hasError())
			{
				$this -> renderError(new Exception($this -> sourceManager -> getError()));
			}
		}

		$fp = fopen($this -> getOption("RESULT_FILE"), "w+");
		fwrite($fp, $content);
		fclose($fp);
		$this -> flags = new stdClass();
		$this -> saveFlags();

		$template = dirname(__FILE__) . "/ui/result.php";
		require($template);
	}

	protected function parsePackage($package)
	{
		$temp = explode(".", strtolower($package));
		if (!$temp[0] || !$temp[1])
		{
			die("Error: Invalid packagename - " . $package);
		}

		return $temp[0] . "." . $temp[1] . "." . ($temp[2] ? $temp[2] : "default");
	}

	public function flag()
	{
		$pkgName = $_POST["packageName"];
		$this -> getFlags();
		if (!array_key_exists($pkgName, $this -> flags))
		{
			$this -> flags[$pkgName] = 0;
		}
		$this -> flags[$pkgName]++;
		$this -> saveFlags();
		return true;
	}

	protected function getFlags()
	{
		if ($this -> flags)
		{
			return $this -> flags;
		}
		$file = dirname(__FILE__) . "/demand-flags.json";
		if (!is_file($file))
		{
			$fp = fopen($file, "w+");
			fwrite($fp, "{}");
			fclose($fp);
		}
		$this -> flags = (array) json_decode(file_get_contents($file));
		return $this -> flags;
	}

	protected function saveFlags()
	{
		$file = dirname(__FILE__) . "/demand-flags.json";
		file_put_contents($file, json_encode($this -> flags));
		return true;
	}

	public function show()
	{
		$template = dirname(__FILE__) . "/ui/listing.php";
		$this -> getFlags();
		$stats = $this -> calcStats();
		$relevancyThreshold = 50;
		require($template);
	}

	protected function calcStats()
	{
		$stats = array();
		$total = 0;
		foreach ($this -> flags as $name => $flag)
		{
			$total += $flag;
		}
		$stats["average"] = count($this -> flags) ? $total / count($this -> flags) : 0;
		foreach ($this -> flags as $name => $flag)
		{
			$stats[$name] = array(
				"relevance" => $stats["average"] ? min($flag / $stats["average"], 1) : 1
			);
		}
		return $stats;
	}

	protected function renderError($exception)
	{
		$template = dirname(__FILE__) . "/ui/error.php";
		require($template);
		die();
	}

}
?>