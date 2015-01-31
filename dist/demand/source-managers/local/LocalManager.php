<?php
require_once(dirname(dirname(__FILE__)) . "/SourceManager.php");

class LocalManager extends DemandSourceManager
{

	public function init()
	{
		if (substr($this -> getOption("LOCAL_REPOSITORY"), -1) !== "/")
		{
			$this -> options["LOCAL_REPOSITORY"] = $this -> getOption("LOCAL_REPOSITORY") . "/";
		}
		if (!$this -> getOption("LOCAL_REPOSITORY") || !is_dir($this -> getOption("LOCAL_REPOSITORY")))
		{
			return $this -> raiseError("Invalid local repository path (" . $this -> getOption("LOCAL_REPOSITORY") . ")!");
		}
	}

	public function grabBaseFile()
	{
		$content = file_get_contents($this -> getOption("LOCAL_REPOSITORY") . "demand.min.js");

		return $content;
	}

	public function grabPackage($packageName)
	{
		$content = "";
		$content .= file_get_contents($this -> getOption("LOCAL_REPOSITORY") . "packages/" . $packageName . ".js") . ";";

		if (is_dir($this -> getOption("LOCAL_REPOSITORY") . "packages/" . $packageName . "/"))
		{
			$files = $this -> getDir($this -> getOption("LOCAL_REPOSITORY") . "packages/" . $packageName . "/");
			foreach ($files as $name)
			{
				$fileName = str_replace(array($this -> getOption("LOCAL_REPOSITORY"), "packages/"), array(dirname($this -> getOption("RESULT_FILE")) . "/", "demand-packages/"), $name);
				$dirName = dirname($fileName);
				if (!is_dir($dirName))
				{
					mkdir($dirName, 0755, true);
				}
				file_put_contents($fileName, file_get_contents($name));
			}
		}

		return $content;
	}

	protected function getDir($path, &$result = null)
	{
		$result = $result ? $result : array();

		$files = array();
		$dp = opendir($path);
		while ($file = readdir($dp))
		{
			if ($file === "." || $file === "..")
			{
				continue;
			}
			$filePath = $path . $file;
			$isDir = is_dir($filePath);
			$files[] = array(
				"path" => $filePath . ($isDir ? "/" : ""),
				"type" => $isDir ? "dir" : "file"
			);
		}
		closedir($dp);

		foreach ($files as $file)
		{
			if ($file["type"] === "dir")
			{
				$this -> getDir($file["path"], $result);
				continue;
			}
			else
			{
				$result[] = $file["path"];
			}
		}

		return $result;
	}

}
?>