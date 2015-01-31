<?php
class DemandSourceManager
{

	protected $error = null;
	protected $options = array();

	public function __construct($options)
	{
		$this -> setOptions($options);
	}

	public function init()
	{

	}

	public function grabBaseFile()
	{
		$this -> raiseError("Unimplemented method: <code>grabBaseFile()</code>");
	}

	public function grabPackage($packageName)
	{
		$this -> raiseError("Unimplemented method: <code>grabPackage(\$packageName)</code>");
	}

	public function setOptions($options)
	{
		$this -> options = $options;
	}

	public function getOption($key, $default = null)
	{
		return $this -> options[$key] ? $this -> options[$key] : $default;
	}

	public function raiseError($message)
	{
		$this -> error = $message;
	}

	public function hasError()
	{
		return ($this -> error !== null);
	}

	public function getError()
	{
		return $this -> error;
	}

}
?>