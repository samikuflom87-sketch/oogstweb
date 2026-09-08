<?php
/**
 * Eén productkaart in de shop. Zelfde opbouw als in de demo:
 * foto, merk, naam, inhoud, prijs, en de knop ónder de prijs — nooit
 * over de foto heen, dat was een bewuste keuze.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $product;

if ( empty( $product ) || ! $product->is_visible() ) {
	return;
}

$uitverkocht = ! $product->is_in_stock();
$voorraad    = $product->get_stock_quantity();
$merk        = $product->get_attribute( 'merk' );
$inhoud      = $product->get_attribute( 'inhoud' );
?>
<li <?php wc_product_class( 'card', $product ); ?>>

	<a class="card__top" href="<?php the_permalink(); ?>">
		<div class="card__media">
			<?php
			if ( has_post_thumbnail() ) {
				echo woocommerce_get_product_thumbnail( 'woocommerce_thumbnail' );
			} else {
				echo '<span class="tile__initial" aria-hidden="true">' . esc_html( mb_substr( $product->get_title(), 0, 1 ) ) . '</span>';
			}
			?>
		</div>

		<?php if ( $uitverkocht ) : ?>
			<span class="badge badge--soldout">Uitverkocht</span>
		<?php elseif ( is_numeric( $voorraad ) && $voorraad <= 3 ) : ?>
			<span class="badge">Bijna weg</span>
		<?php endif; ?>
	</a>

	<div class="card__body">
		<?php if ( $merk ) : ?>
			<span class="card__brand"><?php echo esc_html( $merk ); ?></span>
		<?php endif; ?>

		<h3 class="card__name">
			<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
		</h3>

		<?php if ( $inhoud ) : ?>
			<span class="card__size"><?php echo esc_html( $inhoud ); ?></span>
		<?php endif; ?>

		<div class="card__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>

		<?php
		/* De knop staat bewust ná de prijs. */
		woocommerce_template_loop_add_to_cart(
			array(
				'class' => 'card__add',
			)
		);
		?>
	</div>

</li>
