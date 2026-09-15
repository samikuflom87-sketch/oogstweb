<?php
/**
 * Kop van elke pagina. De opmaak is één op één die van de demo.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link screen-reader-text" href="#inhoud">Naar de inhoud</a>

<?php
/*
 * De lopende balk bovenaan, net als in de demo. Hij wordt hier al
 * volledig opgebouwd en niet pas door JavaScript: zo staat de tekst er
 * meteen, ook als het script traag laadt.
 *
 * De groep staat er twee keer in. De animatie schuift precies één groep
 * op en springt dan terug — daardoor lijkt het een eindeloze band.
 */
$meldingen = cbr_announce_regels();
?>
<?php if ( $meldingen ) : ?>
	<div class="announce">
		<div class="marquee">
			<?php for ( $ronde = 0; $ronde < 2; $ronde++ ) : ?>
				<div class="marquee__group"<?php echo $ronde ? ' aria-hidden="true"' : ''; ?>>
					<?php foreach ( $meldingen as $regel ) : ?>
						<span class="marquee__item"><?php echo esc_html( $regel ); ?></span>
					<?php endforeach; ?>
				</div>
			<?php endfor; ?>
		</div>
	</div>
<?php endif; ?>

<header class="header">
  <div class="header__inner">

    <a class="header__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
      <?php
      if ( has_custom_logo() ) {
      	the_custom_logo();
      } else {
      	printf(
      		'<img src="%s" alt="%s" width="186" height="66" />',
      		esc_url( get_template_directory_uri() . '/assets/logo.svg' ),
      		esc_attr( get_bloginfo( 'name' ) )
      	);
      }
      ?>
    </a>

    <nav class="nav" aria-label="Hoofdmenu">
      <?php
      wp_nav_menu(
      	array(
      		'theme_location' => 'hoofdmenu',
      		'container'      => false,
      		'items_wrap'     => '%3$s',
      		'depth'          => 1,
      		'fallback_cb'    => 'cbr_hoofdmenu_links',
      	)
      );
      ?>
    </nav>

    <div class="header__actions">
      <button class="icon-btn" data-search-toggle aria-label="Zoeken" aria-expanded="false">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
      </button>

      <?php if ( cbr_shop_actief() ) : ?>
        <?php $aantal = ( WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0; ?>
        <?php
        /*
         * Een knop, net als in de demo — geen link. Een link brengt je bij de
         * kleinste hapering in het script naar de winkelmandpagina in plaats
         * van dat de lade openschuift. Met een knop kan dat niet gebeuren.
         * Wie geen JavaScript heeft krijgt de link eronder alsnog.
         */
        ?>
        <button class="icon-btn" type="button" data-cart-open
                aria-label="Winkelmand openen" aria-expanded="false" aria-controls="winkelmandlade">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
          <span class="cart-count"<?php echo $aantal ? '' : ' style="display:none"'; ?>><?php echo esc_html( $aantal ); ?></span>
        </button>
        <noscript>
          <a class="icon-btn" href="<?php echo esc_url( wc_get_cart_url() ); ?>" aria-label="Winkelmand">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
          </a>
        </noscript>
      <?php endif; ?>

      <button class="icon-btn nav-toggle" aria-label="Menu" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>

  </div>

</header>

<div class="search">
  <form class="search__inner" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <input type="search" name="s" placeholder="Zoek een product of merk&hellip;" aria-label="Zoeken" value="<?php echo esc_attr( get_search_query() ); ?>" />
    <input type="hidden" name="post_type" value="product" />
    <button class="screen-reader-text" type="submit">Zoek</button>
  </form>
  <div class="search__results"></div>
</div>

<main id="inhoud">
