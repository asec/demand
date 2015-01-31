<?php
require_once(dirname(dirname(__FILE__)) . "/SourceManager.php");
require_once(dirname(__FILE__) . "/client/GitHubClient.php");

class GithubManager extends DemandSourceManager
{

	protected $client = null;

	public function init()
	{
		try
		{
			$this -> client = new GitHubClient();
			$user = $this -> getOption("GITHUB_USERNAME");
			$this -> client -> setCredentials($user, $this -> getOption("GITHUB_PASSWORD"));
		}
		catch (Exception $e)
		{
			$this -> raiseError($e -> getMessage());
		}
	}

	public function grabBaseFile()
	{
		$baseFile = "dist/demand.min.js";
		$content .= $this -> getFile($baseFile);

		return $content;
	}

	public function grabPackage($packageName)
	{
		$content = "";
		$content .= $this -> getFile("dist/packages/" . $packageName . ".js") . ";";
		$files = $this -> getDir("dist/packages/" . $packageName . "/");
		foreach ($files as $name => $c)
		{
			$fileName = str_replace(array("dist/", "packages/"), array(dirname($this -> getOption("RESULT_FILE")) . "/", "demand-packages/"), $name);
			$dirName = dirname($fileName);
			if (!is_dir($dirName))
			{
				mkdir($dirName, 0755, true);
			}
			file_put_contents($fileName, $c);
		}

		return $content;
	}

	protected function getFile($fileName)
	{
		$content = "";
		try
		{
			$file = $this -> client -> repos -> contents -> getFile($this -> getOption("GITHUB_USERNAME"), $this -> getOption("GITHUB_REPOSITORY", "demand"), $fileName);
			$content = base64_decode($file -> getContent());
		}
		catch (Exception $e)
		{
			$this -> raiseError($e -> getMessage());
		}
		return $content;
	}

	protected function getDir($path, &$result = null)
	{
		$result = $result ? $result : array();
		try
		{
			$files = $this -> client -> repos -> contents -> getDir($this -> getOption("GITHUB_USERNAME"), $this -> getOption("GITHUB_REPOSITORY", "demand"), $path);
			foreach ($files as $file)
			{
				if ($file -> getType() === "dir")
				{
					$this -> getDir($path . $file -> getName() . "/", $result);
					continue;
				}
				else if ($file -> getType() === "file")
				{
					$result[$file -> getPath()] = $this -> getFile($file -> getPath());
				}
			}
		}
		catch (Exception $e)
		{
			if ($e -> getCode() != 4)
			{
				$this -> raiseError($e -> getMessage());
			}
		}
		return $result;
	}

}
?>