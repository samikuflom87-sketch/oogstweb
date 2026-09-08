<?php
/**
 * CurlsbyRuth — thema-instellingen.
 *
 * De huisstijl staat in style.css; die is één op één overgenomen uit de
 * goedgekeurde demo. Hier staat alleen wat WordPress en WooCommerce moeten weten.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CBR_VERSION', '1.0.0' );

/**
 * Basisondersteuning.
 */
function cbr_setup() {
	load_theme_textdomain( 'curlsbyruth', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'customize-selective-refresh-widgets' );
	add_theme_support( 'responsive-embeds' );

	/*
	 * WooCommerce. De galerij-onderdelen zetten we aan zodat de productpagina
	 * dezelfde thumbnails en zoom krijgt als in de demo.
	 */
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	register_nav_menus(
		array(
			'hoofdmenu' => __( 'Hoofdmenu', 'curlsbyruth' ),
			'footer'    => __( 'Footermenu', 'curlsbyruth' ),
		)
	);
}
add_action( 'after_setup_theme', 'cbr_setup' );

/**
 * Stylesheet, lettertypes en scripts.
 */
function cbr_assets() {
	wp_enqueue_style(
		'cbr-fonts',
		'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:ital,wght@0,400;0,600;1,400&display=swap',
		array(),
		null
	);

	wp_enqueue_style( 'cbr-style', get_stylesheet_uri(), array( 'cbr-fonts' ), CBR_VERSION );

	wp_enqueue_script(
		'cbr-app',
		get_template_directory_uri() . '/assets/app.js',
		array(),
		CBR_VERSION,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'cbr_assets' );

/**
 * Sneller laden: de fonts alvast opzoeken terwijl de pagina binnenkomt.
 */
function cbr_resource_hints( $hints, $relation ) {
	if ( 'preconnect' === $relation ) {
		$hints[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
	}
	return $hints;
}
add_filter( 'wp_resource_hints', 'cbr_resource_hints', 10, 2 );

/* -------------------------------------------------------------------------
 * WooCommerce
 * ---------------------------------------------------------------------- */

/**
 * Ruth wil geen categorieën en geen zijbalk: alle producten onder Shop.
 */
remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );

/**
 * Vier producten per rij, alles op één shoppagina.
 */
function cbr_loop_columns() {
	return 4;
}
add_filter( 'loop_shop_columns', 'cbr_loop_columns' );

function cbr_products_per_page() {
	return 24;
}
add_filter( 'loop_shop_per_page', 'cbr_products_per_page' );

/**
 * De standaardopmaak van WooCommerce eruit; de demo-opmaak zit in de
 * eigen templates onder /woocommerce.
 */
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );

/**
 * De foto's die Ruth aanleverde zijn niet groot. Door ze op de kaart niet
 * breder dan 400 px te tonen blijven ze scherp op een telefoon.
 */
function cbr_image_sizes() {
	update_option( 'woocommerce_thumbnail_image_width', 400 );
	update_option( 'woocommerce_single_image_width', 700 );
}
add_action( 'after_switch_theme', 'cbr_image_sizes' );

/**
 * Wettelijk verplicht bij verkoop op afstand: de knop moet duidelijk maken
 * dat er een betaalverplichting ontstaat.
 */
function cbr_order_button_text() {
	return __( 'Bestelling met betaalplicht', 'curlsbyruth' );
}
add_filter( 'woocommerce_order_button_text', 'cbr_order_button_text' );

/**
 * Voorraadmelding in de toon van de shop.
 */
function cbr_stock_html( $html, $product ) {
	$voorraad = $product->get_stock_quantity();

	if ( ! $product->is_in_stock() ) {
		return '<p class="stock-out">Tijdelijk uitverkocht</p>';
	}

	if ( is_numeric( $voorraad ) && $voorraad <= 3 ) {
		return sprintf(
			'<p class="stock-low"><span class="dot"></span>Nog %d op voorraad</p>',
			(int) $voorraad
		);
	}

	return '<p class="stock-ok"><span class="dot"></span>Op voorraad</p>';
}
add_filter( 'woocommerce_get_stock_html', 'cbr_stock_html', 10, 2 );

/**
 * Vaste tabbladen op elke productpagina, in dezelfde volgorde.
 * Ingrediënten en gebruiksaanwijzing komen uit eigen velden, zodat Ruth ze
 * per product kan invullen zonder in de tekst te hoeven knoeien.
 */
function cbr_product_tabs( $tabs ) {
	unset( $tabs['reviews'] );

	$product_id = get_the_ID();

	$ingredienten = get_post_meta( $product_id, '_cbr_ingredienten', true );
	if ( $ingredienten ) {
		$tabs['cbr_ingredienten'] = array(
			'title'    => __( 'Ingrediënten', 'curlsbyruth' ),
			'priority' => 20,
			'callback' => 'cbr_tab_ingredienten',
		);
	}

	$gebruik = get_post_meta( $product_id, '_cbr_gebruik', true );
	if ( $gebruik ) {
		$tabs['cbr_gebruik'] = array(
			'title'    => __( 'Gebruiksaanwijzing', 'curlsbyruth' ),
			'priority' => 30,
			'callback' => 'cbr_tab_gebruik',
		);
	}

	$tabs['reviews'] = array(
		'title'    => __( 'Reviews', 'curlsbyruth' ),
		'priority' => 40,
		'callback' => 'comments_template',
	);

	return $tabs;
}
add_filter( 'woocommerce_product_tabs', 'cbr_product_tabs', 98 );

function cbr_tab_ingredienten() {
	$tekst = get_post_meta( get_the_ID(), '_cbr_ingredienten', true );
	echo '<h2>Ingrediënten</h2>';
	echo wpautop( wp_kses_post( $tekst ) );
	echo '<p class="ingr-note">Deze lijst is overgenomen van de verpakking. Controleer bij twijfel altijd het etiket van het product dat je ontvangt.</p>';
}

function cbr_tab_gebruik() {
	$tekst = get_post_meta( get_the_ID(), '_cbr_gebruik', true );
	echo '<h2>Zo gebruik je het</h2>';
	echo wpautop( wp_kses_post( $tekst ) );
}

/**
 * De twee eigen velden in het productscherm, zodat Ruth ze zelf kan invullen.
 */
function cbr_product_fields() {
	echo '<div class="options_group">';

	woocommerce_wp_textarea_input(
		array(
			'id'          => '_cbr_ingredienten',
			'label'       => __( 'Ingrediënten (INCI)', 'curlsbyruth' ),
			'description' => __( 'Letterlijk overnemen van de verpakking. Verplicht bij online verkoop.', 'curlsbyruth' ),
			'desc_tip'    => true,
			'rows'        => 6,
		)
	);

	woocommerce_wp_textarea_input(
		array(
			'id'          => '_cbr_gebruik',
			'label'       => __( 'Gebruiksaanwijzing', 'curlsbyruth' ),
			'description' => __( 'Twee tot vier zinnen is genoeg.', 'curlsbyruth' ),
			'desc_tip'    => true,
			'rows'        => 4,
		)
	);

	echo '</div>';
}
add_action( 'woocommerce_product_options_general_product_data', 'cbr_product_fields' );

function cbr_save_product_fields( $post_id ) {
	foreach ( array( '_cbr_ingredienten', '_cbr_gebruik' ) as $veld ) {
		if ( isset( $_POST[ $veld ] ) ) {
			update_post_meta( $post_id, $veld, sanitize_textarea_field( wp_unslash( $_POST[ $veld ] ) ) );
		}
	}
}
add_action( 'woocommerce_process_product_meta', 'cbr_save_product_fields' );

/**
 * Merk tonen op de productkaart en de productpagina.
 * Het merk staat als productattribuut 'merk' bij het product.
 */
function cbr_merk( $product = null ) {
	if ( ! $product ) {
		global $product;
	}
	if ( ! $product ) {
		return '';
	}
	return $product->get_attribute( 'merk' );
}
