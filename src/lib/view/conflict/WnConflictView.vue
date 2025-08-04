<script lang="ts" setup>
  import { useWnConflictViewApi } from "./use-wn-conflict-view-api";
  import { WnConflictViewProps } from "./wn-conflict-view-types";
  //-----------------------------------------------------
  defineOptions({
    inheritAttrs: false,
  });
  //-----------------------------------------------------
  const props = defineProps<WnConflictViewProps>();
  const api = useWnConflictViewApi(props);
  //-----------------------------------------------------
</script>
<template>
  <div class="wn-conflict-view">
    <div class="as-empty" v-if="api.isEmpty.value">--No Items--</div>
    <main v-else>
      <section v-for="sec in api.DisplayItems.value">
        <h3>{{ sec.title }} x{{ sec.items.length }}</h3>
        <div class="conflict-item-con">
          <div class="conflict-item" v-for="(cfItem, index) in sec.items">
            <h4>
              <em>{{ index + 1 }}</em>
              <a v-if="cfItem.href" :href="cfItem.href" target="_blank">{{
                cfItem.text
              }}</a>
              <span v-else>{{ cfItem.text }}</span>
            </h4>
            <table>
              <thead>
                <tr class="conflict-item-type">
                  <th class="my-diff-type">Conflict</th>
                  <th class="my-diff-type">Local</th>
                  <th class="ta-diff-type">Remote</th>
                </tr>
              </thead>
              <tbody
                class="conflict-item-fields"
                v-if="cfItem.fields.length > 0">
                <tr class="conflict-item-type">
                  <td class="my-diff-type">Type</td>
                  <td class="my-diff-type">{{ cfItem.myDiffType }}</td>
                  <td class="ta-diff-type">{{ cfItem.taDiffType }}</td>
                </tr>
                <tr v-for="fld in cfItem.fields">
                  <td>
                    <span
                      :data-tip="fld.name"
                      data-tip-delay="200"
                      data-tip-dock-mode="H"
                      data-tip-font-size="b"
                      data-tip-padding="b"
                      >{{ fld.title }}</span
                    >
                  </td>
                  <td>{{ fld.myValue }}</td>
                  <td>{{ fld.taValue }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
    <slot name="footer"> </slot>
  </div>
</template>
<style lang="scss">
  @use "./wn-conflict-view.scss";
</style>
