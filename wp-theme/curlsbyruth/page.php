<?php
/**
 * Losse pagina's: Over ons, Contact, voorwaarden, retourbeleid — en ook de
 * winkelmand en het afrekenen, want dat zijn in WooCommerce gewone pagina's.
 *
 * De opbouw is die van de demo: een kop over de volle breedte met een klein
 * bovenwoord erboven, en daaronder de tekst in een smalle kolom.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();

	$bovenwoord = cbr_bovenwoord( get_the_ID() );

	/*
	 * Het afrekenen begint in de demo meteen met het formulier: een grote kop
	 * erboven duwt de bestelknop van het scherm af en dat kost bestellingen.
	 */
	$breed = cbr_shop_actief() && is_checkout();
	?>

	<?php if ( ! $breed ) : ?>
		<section class="page-head"<?php echo cbr_shop_actief() && is_cart() ? ' style="padding-bottom:20px"' : ''; ?>>
			<div class="wrap">
				<?php if ( $bovenwoord ) : ?>
					<span class="eyebrow"><?php echo esc_html( $bovenwoord ); ?></span>
				<?php endif; ?>
				<h1><?php the_title(); ?></h1>
				<?php if ( $intro = get_post_meta( get_the_ID(), 'cbr_intro', true ) ) : ?>
					<p><?php echo esc_html( $intro ); ?></p>
				<?php endif; ?>
			</div>
		</section>
	<?php endif; ?>

	<div class="section" style="padding-top:0">
		<div class="wrap<?php echo cbr_brede_pagina() ? '' : ' wrap--narrow'; ?>">
			<article <?php post_class( 'prose' ); ?>>
				<?php the_content(); ?>
			</article>
		</div>
	</div>

	<?php
endwhile;

get_footer();
