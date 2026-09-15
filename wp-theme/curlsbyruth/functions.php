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
 * Draait WooCommerce? Het thema moet ook werken als de plugin nog niet
 * geïnstalleerd is — anders krijg je een witte pagina met een kritieke fout
 * op het moment dat je het thema activeert.
 */
function cbr_shop_actief() {
	return class_exists( 'WooCommerce' );
}


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
function cbr_woocommerce_opmaak() {
	remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );
	remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
	remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );
}
add_action( 'init', 'cbr_woocommerce_opmaak' );

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

/* -------------------------------------------------------------------------
 * Wat Ruth zelf kan aanpassen, zonder code
 * ---------------------------------------------------------------------- */

function cbr_customizer( $wp_customize ) {

	$wp_customize->add_section(
		'cbr_shop',
		array(
			'title'       => __( 'CurlsbyRuth', 'curlsbyruth' ),
			'priority'    => 30,
			'description' => __( 'De teksten en foto\'s die je zelf kunt wijzigen.', 'curlsbyruth' ),
		)
	);

	$velden = array(
		'cbr_announce'   => array( 'Balk bovenaan', 'Gratis verzending vanaf € 50', 'text' ),
		'cbr_hero_kop'   => array( 'Kop op de homepage', get_bloginfo( 'name' ), 'text' ),
		'cbr_hero_sub'   => array( 'Slogan op de homepage', 'Your curls, your confidence.', 'text' ),
		'cbr_shop_intro' => array( 'Introtekst op de shoppagina', '', 'text' ),
		'cbr_verhaal'    => array( 'Jouw verhaal op de homepage', '', 'textarea' ),
		'cbr_footer_tekst' => array( 'Tekst onderaan de site', 'Zorgvuldig geselecteerde verzorging voor krullend haar. Met de hand ingepakt en verzonden vanuit Nederland.', 'textarea' ),
		'cbr_email'      => array( 'E-mailadres', '', 'text' ),
		'cbr_kvk'        => array( 'KvK-nummer', '', 'text' ),
		'cbr_btw'        => array( 'Btw-nummer', '', 'text' ),
		'cbr_instagram'  => array( 'Link naar Instagram', '', 'url' ),
		'cbr_tiktok'     => array( 'Link naar TikTok', '', 'url' ),
	);

	foreach ( $velden as $id => $veld ) {
		list( $label, $standaard, $type ) = $veld;

		$wp_customize->add_setting(
			$id,
			array(
				'default'           => $standaard,
				'sanitize_callback' => 'url' === $type ? 'esc_url_raw' : ( 'textarea' === $type ? 'sanitize_textarea_field' : 'sanitize_text_field' ),
				'transport'         => 'refresh',
			)
		);

		$wp_customize->add_control(
			$id,
			array(
				'label'   => $label,
				'section' => 'cbr_shop',
				'type'    => 'url' === $type ? 'url' : $type,
			)
		);
	}

	/* De twee foto's. */
	foreach ( array(
		'cbr_hero_image' => __( 'Grote foto op de homepage', 'curlsbyruth' ),
		'cbr_portret'    => __( 'Foto van jezelf', 'curlsbyruth' ),
	) as $id => $label ) {

		$wp_customize->add_setting(
			$id,
			array(
				'default'           => '',
				'sanitize_callback' => 'absint',
			)
		);

		$wp_customize->add_control(
			new WP_Customize_Media_Control(
				$wp_customize,
				$id,
				array(
					'label'     => $label,
					'section'   => 'cbr_shop',
					'mime_type' => 'image',
				)
			)
		);
	}
}
add_action( 'customize_register', 'cbr_customizer' );

/**
 * Als WooCommerce ontbreekt: zeg het in het beheerpaneel in plaats van
 * de site stil te laten vallen.
 */
function cbr_woocommerce_melding() {
	if ( cbr_shop_actief() || ! current_user_can( 'install_plugins' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>';
	echo '<strong>CurlsbyRuth-thema:</strong> WooCommerce is nog niet actief. ';
	echo 'De site werkt gewoon, maar de shop, de winkelmand en de producten verschijnen pas ';
	echo 'zodra je WooCommerce hebt geïnstalleerd en geactiveerd.';
	echo '</p></div>';
}
add_action( 'admin_notices', 'cbr_woocommerce_melding' );

/**
 * De merken voor de slideshow op de homepage.
 *
 * Elk merk houdt één vaste kleur uit de huisstijl, net als in de demo. Een
 * merk dat er nog niet bij staat krijgt bruin — nooit een verzonnen kleur.
 */
function cbr_merken() {
	if ( ! cbr_shop_actief() ) {
		return array();
	}

	$palet = array(
		'The Doux'     => array( '#C0794E', '#F8E5D8', '#925C3B' ),
		'As I Am'      => array( '#7F9E9B', '#E0EAE8', '#566B69' ),
		'SheaMoisture' => array( '#8FA383', '#E5EBE0', '#5E6C56' ),
		'TGIN'         => array( '#9C6644', '#F1E3D6', '#895A3C' ),
		'Camille Rose' => array( '#D2A85F', '#F8EFDC', '#82683B' ),
		'Mielle'       => array( '#C0794E', '#F8E5D8', '#925C3B' ),
	);

	$termen = get_terms(
		array(
			'taxonomy'   => 'pa_merk',
			'hide_empty' => true,
			'orderby'    => 'count',
			'order'      => 'DESC',
		)
	);

	if ( is_wp_error( $termen ) || empty( $termen ) ) {
		return array();
	}

	$merken = array();

	foreach ( $termen as $term ) {
		$kleuren = isset( $palet[ $term->name ] )
			? $palet[ $term->name ]
			: array( '#9C6644', '#F1E3D6', '#895A3C' );

		$merken[] = array(
			'naam'   => $term->name,
			'aantal' => (int) $term->count,
			'kleur'  => $kleuren[0],
			'zacht'  => $kleuren[1],
			'donker' => $kleuren[2],
			'link'   => ( is_wp_error( get_term_link( $term ) ) ? wc_get_page_permalink( 'shop' ) : get_term_link( $term ) ),
			'foto'   => (int) get_term_meta( $term->term_id, 'cbr_merkfoto', true ),
			'fotos'  => cbr_merk_fotos( $term->name, 3 ),
		);
	}

	return $merken;
}

/**
 * De zachte tint die bij een merk hoort. De productfoto's zijn van de merken
 * zelf en vloeken onderling — neongeel naast knalrood. Door elke foto op een
 * eigen zacht vlak te zetten wordt het één geheel in plaats van een rommeltje.
 */
function cbr_merk_zacht( $naam ) {
	$tinten = array(
		'The Doux'     => '#F8E5D8',
		'As I Am'      => '#E0EAE8',
		'SheaMoisture' => '#E5EBE0',
		'TGIN'         => '#F1E3D6',
		'Camille Rose' => '#F8EFDC',
		'Mielle'       => '#F8E5D8',
	);

	return isset( $tinten[ $naam ] ) ? $tinten[ $naam ] : '#F1E3D6';
}

/**
 * Een paar productfoto's van één merk, voor in de merkslide.
 */
function cbr_merk_fotos( $merk, $aantal = 3 ) {
	if ( ! cbr_shop_actief() ) {
		return array();
	}

	$producten = wc_get_products(
		array(
			'status'     => 'publish',
			'limit'      => $aantal,
			'attribute'  => 'pa_merk',
			'attribute_term' => sanitize_title( $merk ),
		)
	);

	$fotos = array();
	foreach ( $producten as $p ) {
		$id = $p->get_image_id();
		if ( $id ) {
			$fotos[] = (int) $id;
		}
	}

	return $fotos;
}

/**
 * De winkelmandlade.
 *
 * WooCommerce ververst na elke toevoeging een aantal stukjes van de pagina.
 * Door de lade-inhoud en de teller daaraan mee te geven blijven ze kloppen
 * zonder de pagina te herladen.
 */
function cbr_cart_fragments( $fragments ) {
	ob_start();
	get_template_part( 'template-parts/cart-drawer' );
	$fragments['[data-cart-drawer-inhoud]'] = ob_get_clean();

	$aantal = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;

	ob_start();
	printf(
		'<span class="cart-count"%s>%d</span>',
		$aantal ? '' : ' style="display:none"',
		(int) $aantal
	);
	$fragments['span.cart-count'] = ob_get_clean();

	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'cbr_cart_fragments' );

/**
 * Toevoegen aan de winkelmand zonder de pagina te herladen; anders schiet je
 * bij elk product terug naar boven en opent de lade nooit.
 */
function cbr_ajax_toevoegen() {
	update_option( 'woocommerce_enable_ajax_add_to_cart', 'yes' );
	update_option( 'woocommerce_cart_redirect_after_add', 'no' );
}
add_action( 'after_switch_theme', 'cbr_ajax_toevoegen' );

/**
 * De grens voor gratis verzending, zodat het balkje in de lade klopt met wat
 * er in de balk bovenaan staat.
 */
function cbr_gratis_vanaf_instelling( $wp_customize ) {
	$wp_customize->add_setting(
		'cbr_gratis_vanaf',
		array(
			'default'           => 50,
			'sanitize_callback' => 'absint',
		)
	);

	$wp_customize->add_control(
		'cbr_gratis_vanaf',
		array(
			'label'       => __( 'Gratis verzending vanaf (euro)', 'curlsbyruth' ),
			'description' => __( 'Zet op 0 om het balkje in de winkelmand te verbergen.', 'curlsbyruth' ),
			'section'     => 'cbr_shop',
			'type'        => 'number',
		)
	);
}
add_action( 'customize_register', 'cbr_gratis_vanaf_instelling', 20 );
