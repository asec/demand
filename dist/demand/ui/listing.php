<!DOCTYPE html>
<html>
  <head>
    <meta charset='utf-8'>
    <meta http-equiv="X-UA-Compatible" content="chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link href='https://fonts.googleapis.com/css?family=Architects+Daughter' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="./ui/stylesheets/stylesheet.css" media="screen">
    <link rel="stylesheet" type="text/css" href="./ui/stylesheets/demand.css" media="screen">
    <link rel="stylesheet" type="text/css" href="./ui/stylesheets/pygment_trac.css" media="screen">
    <link rel="stylesheet" type="text/css" href="./ui/stylesheets/print.css" media="print">

    <!--[if lt IE 9]>
    <script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <title>Demand by asec</title>
  </head>

  <body>
    <header>
      <div class="inner">
        <h1>Demand</h1>
        <h2>- A JavaScript solution for creating your own CDN for all of your JS code.</h2>
      </div>
    </header>

    <div id="content-wrapper">
      <div class="inner clearfix">
        <section id="main-content">
          <h1>
            <a id="demand" class="anchor" href="#demand" aria-hidden="true"><span class="octicon octicon-link"></span></a>Packages
          </h1>

          <form action="<?php print $_SERVER["PHP_SELF"] ?>" method="post" class="invisible">
          <p>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>Package</th>
                  <th>Relevance</th>
                </tr>
              </thead>
              <tbody>
                <?php if (!$this -> flags): ?>
                <tr>
                  <td colspan="3" class="text-center"><em>There are no packages flagged for local use as of yet!</em></td>
                </tr>
                <?php else: ?>
                <?php foreach ($this -> flags as $name => $count): ?>
                <?php
                $id = str_replace(".", "-", $name);
                $relevance = round($stats[$name]["relevance"] * 100);
                $isRelevant = ($relevance >= $relevancyThreshold);
                ?>
                <tr class="<?php print $isRelevant ? 'relevant' : 'irrelevant' ?>">
                  <td class="text-center"><input type="checkbox" name="packages[]" value="<?php print $name ?>" id="<?php print $id ?>"<?php print $isRelevant ? ' checked="checked"' : '' ?> /></td>
                  <td><label for="<?php print $id ?>"><?php print $name ?></label></td>
                  <td>
                    <div class="relevance">
                      <div class="relevance-label"><?php print $relevance . "%" ?></div>
                      <div class="relevance-bar" style="width: <?php print $relevance . "%;" ?>"></div>
                    </div>
                  </td>
                </tr>
                <?php endforeach ?>
                <?php endif ?>
              </tbody>
            </table>
          </p>

          <?php if ($this -> flags): ?>
          <p>
            &nbsp;
          </p>
          <p class="text-center">
            <button type="submit">Localize the code!</button>
          </p>
          <?php endif ?>
          <input type="hidden" name="action" value="localize" />
          </form>
        </section>

        <aside id="sidebar">

          <p class="repo-owner"><a href="https://github.com/asec/demand">Demand</a> is maintained by <a href="https://github.com/asec">asec</a>.</p>

          <p>Kudos to <a href="https://twitter.com/jasonlong">Jason Long</a> for his <a href="https://github.com/jasonlong/architect-theme">Architect theme</a>.</p>
        </aside>
      </div>
    </div>


  </body>
</html>
