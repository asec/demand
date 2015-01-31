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
            <a id="demand" class="anchor" href="#demand" aria-hidden="true"><span class="octicon octicon-link"></span></a>Localization result
          </h1>

          <p>
            The localization was successfull the following file was the result of the process:<br />
            <code><?php print $this -> getOption("RESULT_FILE") ?></code>
          </p>

          <p>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>Package</th>
                </tr>
              </thead>
              <tbody>
                <?php if (!$packages): ?>
                <tr>
                  <td colspan="3" class="text-center"><em>There were no packages chosen for localization.</em></td>
                </tr>
                <?php else: ?>
                <?php foreach ($packages as $name): ?>
                <tr>
                  <td class="success">Success</td>
                  <td><?php print $name ?></td>
                </tr>
                <?php endforeach ?>
                <?php endif ?>
              </tbody>
            </table>
          </p>
        </section>

        <aside id="sidebar">

          <p class="repo-owner"><a href="https://github.com/asec/demand">Demand</a> is maintained by <a href="https://github.com/asec">asec</a>.</p>

          <p>Kudos to <a href="https://twitter.com/jasonlong">Jason Long</a> for his <a href="https://github.com/jasonlong/architect-theme">Architect theme</a>.</p>
        </aside>
      </div>
    </div>


  </body>
</html>
