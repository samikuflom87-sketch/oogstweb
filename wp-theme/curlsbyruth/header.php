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

<?php if ( $melding = get_theme_mod( 'cbr_announce', 'Gratis verzending vanaf € 50' ) ) : ?>
	<div class="announce"><?php echo esc_html( $melding ); ?></div>
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
      		'fallback_cb'    => false,
      	)
      );
      ?>
    </nav>

    <div class="header__actions">
      <button class="icon-btn" data-search-toggle aria-label="Zoeken" aria-expanded="false">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
      </button>

      <a class="icon-btn" href="<?php echo esc_url( wc_get_cart_url() ); ?>" data-cart-open aria-label="Winkelmand openen">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
        <?php $aantal = WC()->cart ? WC()->cart->get_cart_contents_count() : 0; ?>
        <span class="cart-count"<?php echo $aantal ? '' : ' style="display:none"'; ?>><?php echo esc_html( $aantal ); ?></span>
      </a>

      <button class="icon-btn nav-toggle" aria-label="Menu" aria-expanded="false">
        <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>

  </div>

  <div class="search-bar" data-search-bar hidden>
    <div class="wrap">
      <?php get_search_form(); ?>
    </div>
  </div>
</header>

<main id="inhoud">
