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

/**
 * De zinnen die in de balk bovenaan voorbijkomen. Ruth kan ze zelf
 * aanpassen onder Weergave → Aanpassen; met een | zet ze er een nieuwe
 * zin bij. Laat ze het veld leeg, dan verdwijnt de balk.
 */
const CBR_ANNOUNCE_STANDAARD = 'Gratis verzending vanaf € 50 | Met de hand ingepakt in Nederland | Verzending met PostNL | Speciaal geselecteerd voor krullend haar';

function cbr_announce_regels() {
	$ruw = (string) get_theme_mod( 'cbr_announce', CBR_ANNOUNCE_STANDAARD );

	$regels = array_filter( array_map( 'trim', explode( '|', $ruw ) ) );

	return array_values( $regels );
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
		'cbr_announce'   => array( 'Balk bovenaan (scheid de zinnen met een | )', CBR_ANNOUNCE_STANDAARD, 'text' ),
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

	/* De foto van Ruth zelf, op de homepage en op Over ons. */
	foreach ( array(
		'cbr_portret' => __( 'Foto van jezelf', 'curlsbyruth' ),
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
			'orderby'    => 'name',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $termen ) || empty( $termen ) ) {
		return array();
	}

	/*
	 * De volgorde van de slideshow ligt vast, precies zoals in de demo waar
	 * Ruth akkoord op gaf. Een merk dat daar niet in staat komt er achteraan,
	 * op alfabet, zodat de eerste dia altijd hetzelfde is.
	 */
	$volgorde = array( 'SheaMoisture', 'TGIN', 'Camille Rose', 'Mielle', 'As I Am' );

	usort(
		$termen,
		function ( $a, $b ) use ( $volgorde ) {
			$pa = array_search( $a->name, $volgorde, true );
			$pb = array_search( $b->name, $volgorde, true );
			$pa = ( false === $pa ) ? count( $volgorde ) : $pa;
			$pb = ( false === $pb ) ? count( $volgorde ) : $pb;

			if ( $pa === $pb ) {
				return strcasecmp( $a->name, $b->name );
			}

			return $pa - $pb;
		}
	);

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

/**
 * De categorieën voor de rail op de homepage, met dezelfde vaste kleuren
 * als in de demo. Elke categorie houdt door de hele shop dezelfde tint.
 */
function cbr_categorieen() {
	if ( ! cbr_shop_actief() ) {
		return array();
	}

	$palet = array(
		'shampoo'                    => array( '#9C6644', '#F1E3D6' ),
		'conditioner'                => array( '#8FA383', '#E5EBE0' ),
		'deep-conditioner-masker'    => array( '#D2A85F', '#F8EFDC' ),
		'masker'                     => array( '#D2A85F', '#F8EFDC' ),
		'curl-cream-styler'          => array( '#C0794E', '#F8E5D8' ),
		'mousse-styler'              => array( '#C0794E', '#F8E5D8' ),
		'styler'                     => array( '#C0794E', '#F8E5D8' ),
		'tijdelijke-haarkleur'       => array( '#7F9E9B', '#E0EAE8' ),
		'haarverzorging'             => array( '#8FA383', '#E5EBE0' ),
	);

	$termen = get_terms(
		array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => true,
			'orderby'    => 'count',
			'order'      => 'DESC',
		)
	);

	if ( is_wp_error( $termen ) || empty( $termen ) ) {
		return array();
	}

	/* een reservereeks, zodat een categorie die niet in het palet staat nooit
	   zonder kleur valt maar ook nooit dezelfde krijgt als zijn buurman */
	$reserve = array(
		array( '#9C6644', '#F1E3D6' ),
		array( '#8FA383', '#E5EBE0' ),
		array( '#C0794E', '#F8E5D8' ),
		array( '#D2A85F', '#F8EFDC' ),
		array( '#7F9E9B', '#E0EAE8' ),
	);

	$uit = array();

	foreach ( $termen as $i => $term ) {
		if ( 'uncategorized' === $term->slug || 'geen-categorie' === $term->slug ) {
			continue;
		}

		$kleuren = isset( $palet[ $term->slug ] )
			? $palet[ $term->slug ]
			: $reserve[ $i % count( $reserve ) ];

		$link = get_term_link( $term );

		$uit[] = array(
			'naam'   => $term->name,
			'slug'   => $term->slug,
			'aantal' => (int) $term->count,
			'kleur'  => $kleuren[0],
			'zacht'  => $kleuren[1],
			'link'   => is_wp_error( $link ) ? wc_get_page_permalink( 'shop' ) : $link,
		);
	}

	return $uit;
}

/**
 * De tekst op de knop onder elke kaart. In de demo stond daar "In winkelmand"
 * en bij een leeg schap "Uitverkocht" — niet het standaard "Toevoegen aan
 * winkelwagen" van WooCommerce.
 */
function cbr_knop_tekst( $tekst, $product = null ) {
	if ( ! $product instanceof WC_Product ) {
		return $tekst;
	}

	if ( ! $product->is_in_stock() ) {
		return 'Uitverkocht';
	}

	return 'In winkelmand';
}
add_filter( 'woocommerce_product_add_to_cart_text', 'cbr_knop_tekst', 10, 2 );
add_filter( 'woocommerce_product_single_add_to_cart_text', 'cbr_knop_tekst', 10, 2 );

/**
 * De sorteerkeuze op de shoppagina. WooCommerce biedt er standaard zes aan,
 * waaronder "populariteit" en "gemiddelde beoordeling" — twee lijstjes die
 * in een nieuwe winkel nog leeg zijn en dus niets zeggen. De demo had er
 * vier; dat zijn deze.
 */
function cbr_sorteeropties( $opties ) {
	return array(
		'menu_order' => 'Aanbevolen',
		'price'      => 'Prijs laag → hoog',
		'price-desc' => 'Prijs hoog → laag',
		'title'      => 'Naam A → Z',
	);
}
add_filter( 'woocommerce_catalog_orderby', 'cbr_sorteeropties' );
add_filter( 'woocommerce_default_catalog_orderby_options', 'cbr_sorteeropties' );

/**
 * Op de productpagina zelf stond in de demo de hele zin op de knop.
 */
function cbr_knop_tekst_product( $tekst, $product = null ) {
	if ( $product instanceof WC_Product && ! $product->is_in_stock() ) {
		return 'Uitverkocht';
	}

	return 'Toevoegen aan winkelmand';
}
add_filter( 'woocommerce_product_single_add_to_cart_text', 'cbr_knop_tekst_product', 20, 2 );

/**
 * Het kleine woord boven de paginakop, zoals "Ons verhaal" boven "Over
 * CurlsbyRuth". Voor de vaste pagina's staat het hier; voor elke andere
 * pagina kan Ruth het zelf invullen. Weet ik het niet, dan laat ik het weg
 * in plaats van er iets bij te verzinnen.
 */
function cbr_bovenwoord( $post_id ) {
	$eigen = get_post_meta( $post_id, 'cbr_bovenwoord', true );

	if ( $eigen ) {
		return $eigen;
	}

	if ( cbr_shop_actief() ) {
		if ( is_cart() ) {
			return 'Bijna klaar';
		}

		if ( is_account_page() ) {
			return 'Jouw gegevens';
		}
	}

	$vast = array(
		'over-ons' => 'Ons verhaal',
		'contact'  => 'Contact',
	);

	$slug = get_post_field( 'post_name', $post_id );

	return isset( $vast[ $slug ] ) ? $vast[ $slug ] : '';
}

/**
 * De winkelmand en het afrekenen hebben de volle breedte nodig — daar staan
 * twee kolommen naast elkaar. Een gewone tekstpagina leest juist prettiger
 * in een smalle kolom.
 */
function cbr_brede_pagina() {
	if ( ! cbr_shop_actief() ) {
		return false;
	}

	return is_cart() || is_checkout() || is_account_page();
}

/**
 * De uitklapbare blokken op de productpagina, in dezelfde volgorde als in de
 * demo: omschrijving, ingrediënten, gebruiksaanwijzing, verzending, reviews.
 *
 * Een blok waar nog niets voor is aangeleverd blijft staan, met een eerlijke
 * melding erin. Dat is met opzet: zo ziet Ruth in één oogopslag wat er nog
 * moet gebeuren. Voor de ingrediënten geldt dat extra streng — die lijst moet
 * letterlijk van de verpakking komen. Allergeneninformatie schat je niet.
 */
function cbr_product_accordeon( $product ) {
	$id = $product->get_id();

	$blokken = array();

	$omschrijving = $product->get_description();
	$blokken[]    = array(
		'titel'  => 'Omschrijving',
		'inhoud' => $omschrijving
			? wpautop( wp_kses_post( $omschrijving ) )
			: '<div class="todo">De productomschrijving is nog niet ingevuld.</div>',
		'open'   => true,
	);

	$ingredienten = get_post_meta( $id, '_cbr_ingredienten', true );
	$blokken[]    = array(
		'titel'  => 'Ingrediënten',
		'inhoud' => $ingredienten
			? wpautop( wp_kses_post( $ingredienten ) )
			: '<div class="todo">De volledige ingrediëntenlijst wordt letterlijk overgenomen van de verpakking. Deze mag niet geschat worden — allergeneninformatie moet exact kloppen.</div>',
	);

	$gebruik   = get_post_meta( $id, '_cbr_gebruik', true );
	$blokken[] = array(
		'titel'  => 'Gebruiksaanwijzing',
		'inhoud' => $gebruik
			? wpautop( wp_kses_post( $gebruik ) )
			: '<div class="todo">De gebruiksaanwijzing is nog niet ingevuld.</div>',
	);

	$drempel   = (float) get_theme_mod( 'cbr_gratis_vanaf', 50 );
	$verzend   = get_theme_mod( 'cbr_verzendtekst', '' );
	$blokken[] = array(
		'titel'  => 'Verzending',
		'inhoud' => $verzend
			? wpautop( wp_kses_post( $verzend ) )
			: sprintf(
				'<p>Verzending met PostNL vanuit Nederland, gratis vanaf %s. Elke bestelling wordt met de hand ingepakt.</p>',
				wc_price( $drempel )
			),
	);

	if ( comments_open( $id ) || $product->get_review_count() ) {
		ob_start();
		comments_template();
		$reviews = ob_get_clean();

		$blokken[] = array(
			'titel'  => 'Reviews',
			'inhoud' => $reviews,
		);
	}

	echo '<div class="acc">';

	foreach ( $blokken as $i => $blok ) {
		printf(
			'<div class="acc__item%1$s">
				<button class="acc__btn" type="button" aria-expanded="%2$s">
					<span>%3$s</span>
					<span class="acc__sign" aria-hidden="true">%4$s</span>
				</button>
				<div class="acc__panel">%5$s</div>
			</div>',
			! empty( $blok['open'] ) ? ' open' : '',
			! empty( $blok['open'] ) ? 'true' : 'false',
			esc_html( $blok['titel'] ),
			! empty( $blok['open'] ) ? '−' : '+',
			$blok['inhoud']
		);
	}

	echo '</div>';
}

/**
 * De voorraadregel. WooCommerce zegt alleen "Op voorraad"; in de demo staat
 * er een gekleurd stipje bij en bij een kleine voorraad hoeveel er nog zijn.
 * Dat laatste zet mensen aan tot bestellen én het is gewoon eerlijk.
 */
function cbr_voorraad_html( $html, $product ) {
	if ( ! $product->is_in_stock() ) {
		return '<span class="stock-out"><span class="dot" style="background:currentColor"></span>Uitverkocht</span>';
	}

	$aantal = $product->get_stock_quantity();

	if ( $product->managing_stock() && is_numeric( $aantal ) && $aantal <= 3 ) {
		return sprintf(
			'<span class="stock-low"><span class="dot" style="background:currentColor"></span>Nog %d op voorraad</span>',
			(int) $aantal
		);
	}

	return '<span class="stock-ok"><span class="dot" style="background:currentColor"></span>Op voorraad</span>';
}
add_filter( 'woocommerce_get_stock_html', 'cbr_voorraad_html', 10, 2 );
